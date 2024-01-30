// NanoPay
// https://github.com/fwd/nano-pay
// Follow on Twitter @nano2dev
;(async () => {

	if (window.NanoPay === undefined) window.NanoPay = { debug: false }

	window.NanoPay.rpc = {

	    endpoint: 'https://rpc.nano.to',

		get(endpoint) {
			return new Promise((resolve) => {
			    var xhr = new XMLHttpRequest();
			    xhr.open("GET", endpoint, true);
			    xhr.send();
			    xhr.onload = function() {
			      resolve(JSON.parse(this.responseText))
			    }
			})
		},

		post(endpoint, data) {
			return new Promise((resolve) => {
			    var xhr = new XMLHttpRequest();
			    xhr.open("POST", endpoint, true);
			    xhr.setRequestHeader('Content-Type', 'application/json');
			    xhr.send(JSON.stringify(data));
			    xhr.onload = function() {
			      resolve(JSON.parse(this.responseText))
			    }
			})
		},

       pending(address, count) {
	         return new Promise((resolve) => {
	          count = count && Number(count) > 100 ? 100 : (count || 100)
	          this.post(this.endpoint, { 
	            action: 'receivable', 
	            account: address,
	            count: count,
	            json_block: true,
	            source: true,
	          }).then((res) => {
	            var blocks = []
	            if (res.blocks !== "") {
	                Object.keys(res.blocks).map(hash => {
	                    blocks.push({ 
	                        hash, 
	                        account: res.blocks[hash].source, 
	                        amount_raw: res.blocks[hash].amount,
	                        amount: NanocurrencyWeb.tools.convert(res.blocks[hash].amount, 'RAW', 'NANO'),
	                    })
	                })
	            }
	            resolve(blocks)
	          })
	        })
       },

       history(address, count) {
	        return new Promise((resolve) => {
	          this.post(this.endpoint, { 
	            action: 'account_history', 
	            account: address,
	            count: Number(count) ? Number(count) : 100,
	            raw: true
	          }).then((res) => {
	            if (!Array.isArray(res.history)) return []
	            resolve(res.history.map(a => {
	                a.amount_raw = a.amount
	                a.amount = NanocurrencyWeb.tools.convert(a.amount, 'RAW', 'NANO')
	                return a
	            }))
	          })
	        })
        },

		block(amount, dataset) {
				var block = dataset.find(a => a.amount_raw === NanocurrencyWeb.tools.convert(amount, 'NANO', 'RAW') )
		    return block ? block : false
		},

	    check(address, amount) {
	        try {
	          return this.pending(address).then(async (pending) => {
	            var success = false
	            var block = false
	            if (Array.isArray(pending)) block = this.block(amount, pending)
	            if (!block) {
	                var _history = await this.history(address, 10) // @todo make configurable
	                if (Array.isArray(_history)) block = this.block(amount, _history)
	            }
	            return block
	          })
	        } catch(e) {
	          report(e.message ? e.message : 'Error Occured')
	        }

	    },

	}

    function getRandomArbitrary(min, max) {
        return Math.floor(Math.random() * (max - min) + min)
    }

    function qrcode(address, amount) {
        return new Promise((resolve) => {
          var options = {
            text: `nano:${address}?amount=${amount}`,
            width: 300,
            height: 280,
            logo: "https://pay.nano.to/img/xno.svg", // @todo "Failed to execute 'toDataURL' on 'HTMLCanvasElement'"
          }
          new QRCode(document.getElementById("qrcode"), options);
          resolve()
        })
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      window.NanoPay.dark_mode = true
    }

    window.NanoPay.cancel = (element) => {
    	document.body.style.overflow = 'auto';
        document.getElementById('nano-pay').remove()
        clearInterval(window.NanoPay.interval)
    }

	function addStyleIfNotExists(cssContent) {
	    var styles = document.head.getElementsByTagName('style');
	    var styleExists = false;

	    // Check if the style already exists
	    for (var i = 0; i < styles.length; i++) {
	        if (styles[i].textContent.trim() === cssContent.trim()) {
	            styleExists = true;
	            break;
	        }
	    }

	    // If style doesn't exist, add it to the head
	    if (!styleExists) {
	        var style = document.createElement('style');
	        style.textContent = cssContent;
	        document.head.appendChild(style);
	    }
	}

    window.NanoPay.open = (config) => {

    	config = config || window.NanoPay.config

    	var background = config.background || (window.NanoPay.dark_mode ? '#353535' : 'rgb(247, 247, 247)')
    	var backdrop_background = config.backdrop || (window.NanoPay.dark_mode ? '#3f3f3fe0' : 'rgb(142 142 142 / 93%)')
    	var text_color = config.text || (window.NanoPay.dark_mode ? '#FFF' : '#000')

		// Example usage
		var cssContent = `
		    #nano-pay { font-family: 'Arial'; position: fixed;width: 100%;z-index: 9999;left: 0;top: 0;right: 0;bottom: 0;display: flex;align-items: center;justify-content: center;flex-direction: column;font-size: 15px; }
			#nano-pay-backdrop { background: ${backdrop_background}; width: 100%; height: 100%;  }
			#nano-pay-body { width: 100%;max-width: 420px;display: flex;flex-direction: column;justify-content: center;align-items: center;background:${background};position: absolute;bottom: -100%;transition: all 0.3s ease 0s;color:${text_color};;border-top-left-radius: 4px;border-top-right-radius: 4px;box-shadow: 1px 1px 7px #0003; }
			#nano-pay-header { display: flex; align-items: center; }
			#nano-pay-header > img { max-width: 22px; }
			#nano-pay-header > span { display: block;margin-left: 4px;font-weight: bold;font-size: 106%; }
			#nano-pay-header-container { width: 100%;display: flex;align-items: center;justify-content: space-between;padding: 11px;border-bottom: 1px solid #0000000f; }
			#nano-pay-cancel { color: #1f9ce9 }
			#nano-pay-shipping { display: flex;justify-content: start;width: 100%;padding: 15px 10px;border-bottom: 1px solid #0000000f;position: relative;align-items: start; }
			#nano-pay-shipping svg { max-width: 23px;fill: #1f9ce9;position: absolute;right: 5px;top: 0px;bottom: 0;margin: auto; }
			#nano-pay-shipping-label {  text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.5;  min-width: 90px; font-size: 90% }

			#nano-pay-contact { display: flex;justify-content: start;width: 100%;padding: 15px 10px;border-bottom: 1px solid #0000000f;position: relative;align-items: start; }
			#nano-pay-contact-label {  text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.5; min-width: 90px;  font-size: 90%  }
			#nano-pay-contact svg {  max-width: 23px;fill: #1f9ce9;position: absolute;right: 5px;top: 0px;bottom: 0;margin: auto; }

			#nano-pay-details { display: flex;justify-content: start;width: 100%;padding: 15px 10px;border-bottom: 1px solid #0000000f;position: relative;align-items: start; }

			#nano-pay-details-spacer { text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.5; min-width: 90px; }
			#nano-pay-details-labels { text-transform: uppercase;opacity: 0.5;font-size: 90%;line-height: 17px;letter-spacing: 0.8px; }
			#nano-pay-details-values { text-transform: uppercase;opacity: 1;font-size: 90%;line-height: 17px;letter-spacing: 0.8px; margin-left: auto; }

			#nano-pay-button { display: flex; flex-direction: column; align-items: center; margin: 15px 0 18px 0;  }
			#nano-pay-button span {  margin-top: 10px; display: block; opacity: 0.5; font-size: 85%;  }
		`;

		addStyleIfNotExists(cssContent);

		var mailing_address = localStorage.getItem('nano-pay-address')

		var template = `
		<div id="nano-pay">

			<div id="nano-pay-backdrop" onclick="window.NanoPay.cancel(); return"></div>

		    <div id="nano-pay-body">
					
				<div id="nano-pay-header-container"> 
					<div id="nano-pay-header">
						<img src="https://pay.nano.to/img/xno.svg"> 
						<span>Pay</span> 
					</div>

					<div id="nano-pay-cancel" onclick="window.NanoPay.cancel(); return"> Cancel </div> 
				</div>

				<div style="display: ${config.contact ? 'block' : 'none'}" onclick="window.NanoPay.configEmailAddress()" id="nano-pay-contact"> 
					<div id="nano-pay-contact-label">EMAIL</div> 
					<div style="line-height: 1.1; opacity: ${config.contact_email ? '1' : '0.5'}">${config.contact_email || 'N/A'}</div> 
					<svg id="Layer_1" version="1.1" viewBox="0 0 512 512" width="512px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon points="160,115.4 180.7,96 352,256 180.7,416 160,396.7 310.5,256 "></polygon></svg> 
				</div>
				
				<div style="display: ${config.shipping ? 'block' : 'none'}" onclick="window.NanoPay.configMailingAddress()" id="nano-pay-shipping"> 
					<div id="nano-pay-shipping-label">SHIPPING</div> 
					<div style="line-height: 1.1; opacity: ${config.mailing_address ? '1' : '0.5'}">${config.mailing_address || 'N/A'}</div> 
					<svg id="Layer_1" version="1.1" viewBox="0 0 512 512" width="512px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon points="160,115.4 180.7,96 352,256 180.7,416 160,396.7 310.5,256 "></polygon></svg> 
				</div>

				<div id="nano-pay-details"> 
					<div style="display: ${config.shipping ? 'block' : 'none'}" id="nano-pay-details-spacer"></div>
					<div id="nano-pay-details-labels">
						<div style="display: ${config.shipping ? 'block' : 'none'}">Subtotal</div>  
						<div style="display: ${config.shipping ? 'block' : 'none'}">Shipping</div>  
						<br style="display: ${config.shipping ? 'block' : 'none'}">
						<div>@Nano2dev</div>  
					</div>  
					<div id="nano-pay-details-values">
						<div style="display: ${config.shipping ? 'block' : 'none'}">${config.amount} XNO</div>   
						<div style="display: ${config.shipping ? 'block' : 'none'}">${config.amount} XNO</div>   
						<br style="display: ${config.shipping ? 'block' : 'none'}"> 
						<div>${config.amount} XNO</div>   
					</div> 
				</div>

			    <div id="nano-pay-button"> 
			    	<img src="https://pay.nano.to/img/natrium.png" style=" max-width: 40px; "> 
			    	<span ">Pay with Natrium</span> 
			    </div>
		    </div>
		</div>`

	    document.body.innerHTML += template;
	    
	    setTimeout(() => {
	    	document.body.style.overflow = 'hidden';
	    	document.getElementById('nano-pay-body').style.bottom = "0"; 
	    }, 100)

	    var checks = 0

	    // window.NanoPay.interval = setInterval(async () => {
	    // 	if (window.NanoPay.debug) return
	    // 	if (checks < 60) {
		//     	var block = await window.NanoPay.rpc.check(config.address)
		//     	if (block && block.hash) {
		//     		window.alert('Success')
		//     		// window.NanoPay.success(element, null, block)
		//     		clearInterval(window.NanoPay.interval)
		//     		return
		//     	}
	    // 	} else clearInterval(window.NanoPay.interval)
	    // }, 5000)

    }

    window.NanoPay.configMailingAddress = () => {
    	var shipping = window.prompt('Shipping Address: ')
    	if (shipping) {
    		localStorage.setItem('nano-pay-mailing-address', shipping)
    		window.NanoPay.open()
    	}
    }

    window.NanoPay.configEmailAddress = () => {
    	var contact = window.prompt('Contact Address: ')
    	if (contact) {
    		localStorage.setItem('nano-pay-contact-email', contact)
    		window.NanoPay.open()
    	}
    }

    window.NanoPay.init = async () => {
        
        var all = document.querySelectorAll('[data-amount]');

        for (var i=0, max=all.length; i < max; i++) {

            var item = all[i]

			var config = {
				amount: item.getAttribute('data-amount'),
				address: item.getAttribute('data-address') || item.getAttribute('data-name'),
				shipping: item.getAttribute('data-shipping') || false,
				contact: item.getAttribute('data-contact') || false,
			}

            all[i].innerHTML = ''
            
            let code = `<div onclick="window.NanoPay.open()" style="cursor: pointer;padding: 7px 25px;border-radius: 4px;margin: 15px 0 10px 0;display: flex;align-items: center;justify-content: center;background: #ffffff;font-family: Helvetica, 'Arial';letter-spacing: 1px;min-height: 48px; color: ${config.color || '#000'}">
        		<img style="max-width: 24px;width: auto;min-width: auto;margin: 0 8px 0 0!important;float: none;" src="https://pay.nano.to/img/xno.svg" alt="">${ config.button || 'Pay with Nano' }</div>`

            code += '</div>'

            item.innerHTML += code

            window.NanoPay.config = config

        }

    }

})();

window.NanoPay.init()