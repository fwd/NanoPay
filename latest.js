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

    window.NanoPay.open = (amount, address, title, color) => {

        // var data = { 
        // 	arbitrary: `0${getRandomArbitrary(10000000, 99999999)}`, 
        // 	amount: amount 
        // }
        	
    	// data.common = `${amount}${data.arbitrary}`

    	var mailing_address = localStorage.getItem('nano-pay-address')

var template = `<div id="nano-pay" style="font-family: 'Arial'; position: fixed;width: 100%;z-index: 9999;left: 0;top: 0;right: 0;bottom: 0;display: flex;align-items: center;justify-content: center;flex-direction: column;font-size: 15px;">

	<div id="backdrop" style=" background:${window.NanoPay.dark_mode ? '#3f3f3fe0' : 'rgb(142 142 142 / 93%)'}; width: 100%; height: 100%; " onclick="window.NanoPay.cancel(); return"></div>

    <div id="nano-body" style="width: 100%;max-width: 420px;display: flex;flex-direction: column;justify-content: center;align-items: center;background:${window.NanoPay.dark_mode ? '#353535' : 'rgb(247, 247, 247)'};position: absolute;bottom: -100%;transition: all 0.3s ease 0s;color:${window.NanoPay.dark_mode ? '#FFF' : '#000'};;border-top-left-radius: 4px;border-top-right-radius: 4px;box-shadow: 1px 1px 7px #0003;">
			
			<div style="width: 100%;display: flex;align-items: center;justify-content: space-between;padding: 11px;border-bottom: 1px solid #0000000f;"> 
			<div style=" display: flex; align-items: center; "> <img src="https://pay.nano.to/img/xno.svg" style="max-width: 22px;"> <span style="display: block;margin-left: 4px;font-weight: bold;font-size: 106%;">Pay</span> </div>

			<div style="color: #1f9ce9" onclick="window.NanoPay.cancel(); return"> Cancel </div> 
			</div>

			<div onclick="window.NanoPay.setAddress()" style="display: flex;justify-content: start;width: 100%;padding: 15px 10px;border-bottom: 1px solid #0000000f;position: relative;align-items: start;"> <div style=" text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.5;  min-width: 90px; font-size: 90%">Address</div> <div style="line-height: 1.1">${mailing_address}</div> <svg id="Layer_1" style="max-width: 23px;fill: #1f9ce9;position: absolute;right: 5px;top: 0px;bottom: 0;margin: auto;" version="1.1" viewBox="0 0 512 512" width="512px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon points="160,115.4 180.7,96 352,256 180.7,416 160,396.7 310.5,256 "></polygon></svg> </div>

			<div style="display: flex;justify-content: start;width: 100%;padding: 15px 10px;border-bottom: 1px solid #0000000f;position: relative;align-items: start;"> <div style=" text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.5; min-width: 90px;  font-size: 90% ">Contact</div> <div>steve@apple.com</div> <svg id="Layer_1" style="max-width: 23px;fill: #1f9ce9;position: absolute;right: 5px;top: 0px;bottom: 0;margin: auto;" version="1.1" viewBox="0 0 512 512" width="512px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon points="160,115.4 180.7,96 352,256 180.7,416 160,396.7 310.5,256 "></polygon></svg> </div>

			<div style="display: flex;justify-content: start;width: 100%;padding: 15px 10px;border-bottom: 1px solid #0000000f;position: relative;align-items: start;"> 
				<div style=" text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.5; min-width: 90px; "></div>
				<div style="text-transform: uppercase;opacity: 0.5;font-size: 90%;line-height: 17px;letter-spacing: 0.8px;">
					<div>Subtotal</div>  
					<div>Shipping</div>  
					<br>
					<div>Pay Nano2dev</div>  
				</div>  
				<div style="text-transform: uppercase;opacity: 1;font-size: 90%;line-height: 17px;letter-spacing: 0.8px; margin-left: auto; ">
					<div>${amount} XNO</div>   
					<div>${amount} XNO</div>   
					<br> 
					<div>${amount} XNO</div>   
				</div> 
			</div>

		    <div style=" display: flex; flex-direction: column; align-items: center; margin: 15px 0 18px 0; "> <img src="https://pay.nano.to/img/natrium.png" style=" max-width: 40px; "> <span style=" margin-top: 10px; display: block; opacity: 0.5; font-size: 85%; ">Open Natrium</span> </div>

    </div>
</div>

`
	    document.body.innerHTML += template;
	    
	    setTimeout(() => {
	    	document.body.style.overflow = 'hidden';
	    	document.getElementById('nano-body').style.bottom = "0"; 
	    }, 100)

	    var checks = 0

	    window.NanoPay.interval = setInterval(async () => {
	    	if (window.NanoPay.debug) return
	    	if (checks < 60) {
		    	var block = await window.NanoPay.rpc.check(address)
		    	if (block && block.hash) {
		    		window.alert('Success')
		    		// window.NanoPay.success(element, null, block)
		    		clearInterval(window.NanoPay.interval)
		    		return
		    	}
	    	} else clearInterval(window.NanoPay.interval)
	    }, 5000)

    }

    window.NanoPay.setAddress = () => {
    	var address = window.prompt('Mailing Address: ')
    	if (address) localStorage.setItem('nano-pay-address', address)
    	window.NanoPay.open()
    }

    window.NanoPay.init = async () => {

        // if (typeof config === 'string' && config.includes('nano_')) {
        //     config = { address: config }
        // } else {
        //     config = config || {}
        // }

        // if ( !config.address || !config.address.includes('nano_') ) return console.error('Nano: NANO payment address invalid:', config.element)

        // if ( !NanocurrencyWeb.tools.validateAddress(config.address) ) return console.error('Nano: NANO payment address invalid:', config.element)

        // if (!config.element) return console.error('Nano: No premium element provided:', config.element)
        // if (!config.amount) return console.error('Nano: No price provided:', config.element)

        // if (config.endpoint || config.node) window.NanoPay.rpc.endpoint = config.endpoint || config.node
        // if (config.debug) window.NanoPay.debug = config.debug 
        // if (config.success) window.user_success = config.success 
        
        var all = document.querySelectorAll('[data-amount]');

        for (var i=0, max=all.length; i < max; i++) {

            // window.NanoPay[i] = all[i].innerHTML

            var item = all[i]

			var config = {
				amount: item.getAttribute('data-amount'),
				address: item.getAttribute('data-address') || item.getAttribute('data-name'),
			}

			// if ( config && config.address && config.address.includes('@') ) {
			// 	var names = (await window.NanoPay.rpc.get('https://nano.to/known.json'))
			// 	config.address = names.length ? names.find(a => a.name.toLowerCase() == config.address.replace('@', '').toLowerCase()).address : false
			// }

            all[i].innerHTML = ''
            
            let code = `<div onclick="window.NanoPay.open('${item.getAttribute('data-amount')}')" style="cursor: pointer;padding: 7px 25px;border-radius: 4px;margin: 15px 0 10px 0;display: flex;align-items: center;justify-content: center;background: #ffffff;font-family: Helvetica, 'Arial';letter-spacing: 1px;min-height: 48px; color: ${config.color || '#000'}">
        <img style="max-width: 24px;width: auto;min-width: auto;margin: 0 8px 0 0!important;float: none;" src="https://pay.nano.to/img/xno.svg" alt="">
        ${ config.button || 'Pay with Nano' }
    </div>`

            code += '</div>'

            item.innerHTML += code

            window.NanoPay.config = config

        }

    }


})();

window.NanoPay.init()