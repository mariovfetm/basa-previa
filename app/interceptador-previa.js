// Entrega ao Flutter os arquivos de arquivos-previa.js quando a página abre direto do disco.
(function () {
  var arquivos = window.__arquivosPrevia || {};
  var pasta = new URL(".", document.baseURI).href;
  var decodificados = {};
  function chave(url) {
    try {
      var abs = new URL(url, document.baseURI).href.split("#")[0].split("?")[0];
      if (abs.indexOf(pasta) !== 0) return null;
      var k = decodeURIComponent(abs.slice(pasta.length));
      return Object.prototype.hasOwnProperty.call(arquivos, k) ? k : null;
    } catch (e) {
      return null;
    }
  }
  function bytes(k) {
    if (!decodificados[k]) {
      var b = atob(arquivos[k][1]);
      var u = new Uint8Array(b.length);
      for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
      decodificados[k] = u;
    }
    return decodificados[k].slice();
  }
  var fetchOriginal = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = function (entrada, opcoes) {
    var url = typeof entrada === "string" ? entrada : entrada && entrada.url ? entrada.url : String(entrada);
    var k = chave(url);
    if (k === null) return fetchOriginal(entrada, opcoes);
    return Promise.resolve(new Response(bytes(k), { status: 200, statusText: "OK", headers: { "Content-Type": arquivos[k][0] } }));
  };
  var abrir = XMLHttpRequest.prototype.open;
  var enviar = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (metodo, url) {
    this.__chavePrevia = chave(url);
    return abrir.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    var k = this.__chavePrevia;
    if (k === null || k === undefined) return enviar.apply(this, arguments);
    var x = this;
    var dados = bytes(k);
    var tipo = x.responseType;
    var resposta = tipo === "arraybuffer" ? dados.buffer : tipo === "blob" ? new Blob([dados], { type: arquivos[k][0] }) : tipo === "json" ? JSON.parse(new TextDecoder().decode(dados)) : new TextDecoder().decode(dados);
    var fixar = function (nome, valor) { Object.defineProperty(x, nome, { configurable: true, get: function () { return valor; } }); };
    fixar("readyState", 4);
    fixar("status", 200);
    fixar("statusText", "OK");
    fixar("response", resposta);
    if (!tipo || tipo === "text") fixar("responseText", resposta);
    fixar("responseURL", new URL(k, pasta).href);
    x.getResponseHeader = function (n) { return String(n).toLowerCase() === "content-type" ? arquivos[k][0] : null; };
    x.getAllResponseHeaders = function () { return "content-type: " + arquivos[k][0] + "\r\n"; };
    setTimeout(function () {
      x.dispatchEvent(new Event("readystatechange"));
      x.dispatchEvent(new ProgressEvent("load", { lengthComputable: true, loaded: dados.length, total: dados.length }));
      x.dispatchEvent(new ProgressEvent("loadend", { lengthComputable: true, loaded: dados.length, total: dados.length }));
    }, 0);
  };
})();
