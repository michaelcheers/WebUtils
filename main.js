document.body.innerHTML = atob('PGRpdiBpZD1wMD4NCiAgICA8dWw+DQogICAgICAgIDxsaT48YSBocmVmPSJqYXZhc2NyaXB0OmdvKDApIj5UZXh0IEVkaXRvcjwvYT48L2xpPg0KICAgICAgICA8bGk+PGEgaHJlZj0iamF2YXNjcmlwdDpnbygxKSI+Q2hhdDwvYT48L2xpPg0KICAgIDwvdWw+DQo8L2Rpdj4NCjxkaXYgaWQ9cDE+DQo8aW5wdXQgdHlwZT0iZmlsZSIgaWQ9InVwbG9hZCIgb25jaGFuZ2U9InVwbG9hZEZpbGUoMCkiIC8+PGJyIC8+DQpMaW5lIFRlcm1pbmF0b3I6IDxpbnB1dCBpZD0ibGluZVRlcm1pbmF0b3IiIHZhbHVlPSJcclxuIiAvPjxiciAvPg0KQ29kZSBUeXBlOiA8c2VsZWN0IGlkPSJsYW5ndWFnZVNlbGVjdCIgb25jaGFuZ2U9ImVkaXRvckNoYW5nZSgpIj48L3NlbGVjdD4NCjxkaXYgaWQ9InRleHRCb3giIHN0eWxlPSJ3aWR0aDoxMDAwcHg7aGVpZ2h0OjUwMHB4OyI+c29tZSB0ZXh0PC9kaXY+DQo8YSBocmVmPSJqYXZhc2NyaXB0OnNhdmVUZXh0KHRydWUpIj5Eb3dubG9hZDwvYT48YnIgLz4NCjxhIGhyZWY9ImphdmFzY3JpcHQ6c2F2ZVRleHQoZmFsc2UpIj5SdW4vQXMgUmF3PC9hPg0KPC9kaXY+DQo8ZGl2IGlkPSJwMiI+DQogICAgPGlucHV0IGlkPSJtZXNzYWdlIiAvPjxiciAvPg0KICAgIDx0YWJsZSBpZD0ibWVzc2FnZVRhYmxlIj4NCg0KICAgIDwvdGFibGU+DQo8L2Rpdj4=');
var currentExt, editor, myUsername;
changePage(0);
function loadScript(url) {

}
function uploadFile(n, fileReader) {
    switch (n) {
        case 0:
            var file = upload.files[0];
            var mode = require("ace/ext/modelist").getModeForPath(file.name).mode;
            languageSelect.value = mode.substr('ace/mode/'.length);
            editorChange();
            fileReader = new FileReader();
            fileReader.readAsText(file);
            fileReader.onload = function () { uploadFile(1, fileReader); };
            break;
        case 1:
            upload.value = null;
            editor.setValue(fileReader.result.replace(/\r/g, ''));
            break;
    }
}
function editorChange() {
    currentExt = require('ace/ext/modelist').modesByName[languageSelect.value].extensions.split('|')[0];
    var script = document.createElement('script');
    script.src = 'Ace/mode-' + languageSelect.value + '.js';
    script.onload = function () {
        var cMode = require("ace/mode/" + languageSelect.value).Mode;
        editor.session.setMode(new cMode());
    };
    document.head.appendChild(script);
}
function updateChat(conn) {
    console.log('updating connection...');
    message.disabled = false;
    message.onkeydown = function (e) {
        if (e.keyCode === 13) {
            console.log("Sending message: " + message.value);
            var row = document.createElement('tr');
            var bold = document.createElement('b');
            bold.innerHTML = 'You: ';
            row.appendChild(bold);
            row.appendChild(new Text(message.value));
            messageTable.appendChild(row);
            conn.send(myUsername + ':' + message.value);
            message.value = "";
        }
    };
    conn.on('data', function (data) {
        var dataSplit = data.split(':');
        var message = dataSplit[1];
        var otherUsername = dataSplit[0];
        var row = document.createElement('tr');
        var bold = document.createElement('b');
        bold.innerHTML = otherUsername + ": ";
        row.appendChild(bold);
        row.appendChild(new Text(message));
        messageTable.appendChild(row);
    });
}
function go(pageN) {
    switch (pageN) {
        case 0:
            changePage(1);
            for (var language in require('ace/ext/modelist').modesByName) {
                var option = document.createElement('option');
                option.value = language;
                option.innerHTML = language;
                languageSelect.appendChild(option);
            }
            languageSelect.value = "csharp";
            editor = ace.edit("textBox");
            editor.setTheme("ace/theme/twilight");
            editorChange();
            break;
        case 1:
            message.disabled = true;
            var peer = new Peer(myUsername = prompt("Choose a username..."), { key: 'q9m5c1m8qc1ve7b9' });
            var otherUsername = prompt("Other user's username... Empty if other chatter hasn't started yet...");
            if (otherUsername !== "") {
                var conn = peer.connect(otherUsername);
                conn.on('open', function () { updateChat(conn) });
            }
            else
                peer.on('connection', updateChat);
            changePage(2);
            break;
    }
}
function saveText(save) {
    var download = document.createElement('a');
    download.href = 'data:' + (save ? '' : (currentExt === 'html' ? 'text/html' : 'text/plain')) + ';base64,' + btoa(editor.getValue().replace(/\n/g, eval('\'' + lineTerminator.value + '\'')));
    if (save)
        download.download = "download." + currentExt;
    else
        download.target = "_blank";
    download.click();
}
function changePage(n) {
    for (var index = 0; index < 3; index++) {
        document.getElementById("p" + index).style.display = n === index ? "initial" : "none";
    }
}