const http = require("http");
const net = require("net");
const url = require("url");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer({});

// Handle normal HTTP requests
const server = http.createServer((req, res) => {
  console.log(`➡️ HTTP ${req.method} ${req.url}`);
  proxy.web(req, res, { target: req.url, changeOrigin: true }, (err) => {
    res.writeHead(502);
    res.end("Bad Gateway");
  });
});

// Handle HTTPS CONNECT requests (tunneling)
server.on("connect", (req, clientSocket, head) => {
  const { port, hostname } = url.parse(`//${req.url}`, false, true);

  const serverSocket = net.connect(port || 443, hostname, () => {
    clientSocket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on("error", (err) => {
    clientSocket.end();
  });
});

server.listen(8080, () => console.log("🌐 HTTP+HTTPS proxy running on port 8080"));
