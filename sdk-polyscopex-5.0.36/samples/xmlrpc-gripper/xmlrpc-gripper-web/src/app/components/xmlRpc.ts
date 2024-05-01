export class XmlRpc {

  constructor(private readonly url: string) {
  }

  /**
   * Creates and invokes an XmlRpc request, compliant with http://xmlrpc.com/spec.md
   * @param methodName Name of the method on the XmlRpc server
   * @param params Parameters for the method
   */
  async sendXmlRpcRequest(methodName: string, params: number[]) {
    const xmlRequest = this.createRequest(methodName, params);

    return fetch(this.url, {
      method: 'post',
      headers: {
        'Content-Type': 'text/xml',
        'Content-Length': xmlRequest.length + ''
      },
      body: xmlRequest
    });
  }

  private createRequest(methodName: string, params: number[]) {
    const xmlRequest = `<?xml version="1.0"?>
<methodCall>
  <methodName>${methodName}</methodName>
  <params>
    ${this.createParamsElement(params)}
  </params>
</methodCall>`;
    return xmlRequest;
  }

  private createParamsElement(params: number[]) {
    let result = '';
    for (const par of params) {
      result += this.createParam(par);
    }
    return result;
  }

  private createParam(par?: number) {
    let result = '';
    if (par) {
      result = `<param>
      <value>
        <i4>${par}</i4>
      </value>
    </param>`;
    }
    return result;
  }
}
