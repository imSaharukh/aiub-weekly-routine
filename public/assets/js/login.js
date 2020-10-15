

async function sendData(){


    var data= {
        id : document.getElementById("inputEmail").value,
        pass : document.getElementById("inputPassword").value,
    }

    fetch("/pdf", {
        method: "POST", // or 'PUT'
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then(function(resp) {
        return resp.blob();
      }).then(function(blob) {
        download(blob);
      });
    };




