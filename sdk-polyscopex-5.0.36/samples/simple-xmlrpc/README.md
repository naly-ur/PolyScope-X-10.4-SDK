# Simple XML-RPC Sample

This sample contains an example of how to communicate from both URScript and the frontend with a backend using XML-RPC (no 3rd party libraries required).

## XML-RPC Client Library (Front-end)

The URCap contains an XML-RPC Client library (located in the `xmlrpc/` folder in the front-end) that automatically serialises four out of the six (4/6) supported value types used in XML-RPC communication (`int`, `double`, `boolean` and `string`). It additionally handles arrays and structs of any combination (e.g. array of structs, struct of structs, etc.). The values, arrays and struct section is based on [http://xmlrpc.com/spec.md](http://xmlrpc.com/spec.md).

### Values (`<value>`)

| Tag | Type | Example |
|-----|------|---------|
| `<int>` | four-byte signed integer | -12 |
| `<double>` | double-precision signed floating point number | -3.14 |
| `<boolean>` |	0 (false) or 1 (true) | 1 |
| `<string>` | string | "hello world" |

### Arrays (`<array>`)

A value can also be of type `<array>`. An `<array>` contains a single `<data>` element, which can contain any number of `<value>`s.

**Example:**

```xml
<array>
    <data>
        <value><int>12</int></value>
        <value><double>3.14</double></value>
        <value><string>Denmark</string></value>
        <value><boolean>0</boolean></value>
    </data>
</array>
```

### Structs (`<struct>`)

A value can also be of type `<struct>`. A `<struct>` contains `<member>`s and each `<member>` contains a `<name>` and a `<value>`.

**Example:**

```xml
<struct>
    <member>
        <name>lowerBound</name>
        <value><int>18</int></value>
    </member>
    <member>
        <name>upperBound</name>
        <value><int>139</int></value>
    </member>
</struct>
```


### Introspection Functions
If the XML-RPC server has registered the introspection functions (`SimpleXMLRPCServer.register_introspection_functions()`) then it is possible for the client to ask for a list of methods using the (`system.listMethods`) function.

Example:

```ts
// Create URL for contacting the backend
const url = this.applicationAPI.getContainerContributionURL(VENDOR_ID, URCAP_ID, 'simple-xmlrpc-backend', 'xmlrpc');

// Create instance of XmlRpcClient
this.xmlrpc = new XmlRpcClient(`${location.protocol}//${url}/`);

// Get list of available methods on the server
const response = await this.xmlrpc.methodCall('system.listMethods');
```

**Please Note** that URScript cannot handle list of strings so avoid calling `system.listMethods` from there.

## How does it work?
The example includes buttons in the application node that sends XML-RPC requests to the server that unpacks it and directly returns the message to the client again.

#### Serialise data (client -> server)
Whenever the client calls an XML-RPC methods with parameters, these are serialised in the XML-RPC client library. The below shows the "Send Struct" example:

```xml
<?xml version="1.0"?>
<methodCall>
  <methodName>echo_struct_method</methodName>
  <params>
    <param>
      <struct>
        <member>
          <name>name</name>
          <value><string>John</string></value>
        </member>
        <member>
          <name>age</name>
          <value><double>30.7</double></value>
        </member>
        <member>
          <name>address</name>
          <struct>
            <member>
              <name>city</name>
              <value><string>Odense</string></value>
            </member>
            <member>
              <name>zipCode</name>
              <value><int>5220</int></value>
            </member>
          </struct>
        </member>
        <member>
          <name>hobbies</name>
          <array>
            <data>
              <value><string>Reading</string></value>
              <value><string>Gardening</string></value>
            </data>
          </array>
        </member>
      </struct>
    </param>
  </params>
</methodCall>
```

#### Deserialise (server -> client)

When the XML-RPC method returns, the `<methodResponse>` is unpacked and the data is deserialised into a JS object.

Example:

```ts
{
    name: "John",
    age: 30.7,
    address: {
        city: "Odense",
        zipCode: 5220
    },
    city: "Odense",
    zipCode: 5220,
    hobbies: [
        "Reading",
        "Gardening"
    ]
}
```


## Build

To build contribution type:

`$ npm install && npm run build`

## Deploy

To deploy sample type:

`$ npm run install-urcap`

## Debug Output from Backend

`$ docker exec -it web-simulator-runtime-1 bash`

Find the container ID of the backend image (universal-robots_simple-xmlrpc_simple-xmlrpc-backend:latest)

`$ docker ps`

Use this ID to get the output

`$ docker logs -f CONTAINER_ID`