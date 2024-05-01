export function deserializeMethodResponse(xml: string) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, 'text/xml');

    const parseValue = (node: Element) => {
        const childNode = node.firstElementChild;

        if (childNode) {
            switch (childNode.nodeName) {
                case 'string':
                    return childNode.textContent || '';
                case 'int':
                case 'i4':
                    return parseInt(childNode.textContent || '0', 10);
                case 'double':
                    return parseFloat(childNode.textContent || '0.0');
                case 'boolean': {
                    const textContent = childNode.textContent;
                    return textContent === '1' || (textContent && textContent.toLowerCase() === 'true');
                }
                case 'array': {
                    const data = childNode.querySelector('data');
                    if (data) {
                        const values = Array.from(data.querySelectorAll('value'));
                        return values.map(parseValue);
                    }
                    return [];
                }
                case 'struct': {
                    const structObj: { [key: string]: unknown } = {};
                    Array.from(childNode.querySelectorAll('member')).forEach((member) => {
                        const name = member.querySelector('name')?.textContent || '';
                        const valueNode = member.querySelector('value');
                        structObj[name] = valueNode ? parseValue(valueNode) : null;
                    });
                    return structObj;
                }
            }
        }
        return null;
    };


    const methodResponseNode = xmlDoc.querySelector('methodResponse');
    if (methodResponseNode) {
        const paramsNode = methodResponseNode.querySelector('params');
        if (paramsNode) {
            const paramNode = paramsNode.querySelector('param');
            if (paramNode) {
                const valueNode = paramNode.querySelector('value');
                if (valueNode) {
                    return parseValue(valueNode);
                }
            }
        }
    }
    return null;
}
