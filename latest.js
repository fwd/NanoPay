// NanoPay
// https://github.com/fwd/nano-pay
// Follow on Twitter @nano2dev
;(async () => {

	const version = '1.0.0'

	if (window.NanoPay === undefined) window.NanoPay = { debug: false }

	window.NanoPay.RPC = {

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

    window.NanoPay.close = (element) => {
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

    window.NanoPay.submit = (config) => {
	    if (window.NanoPay.config.contact && !window.NanoPay.config.contact_email) return alert('Email Address Required.')
	    if (window.NanoPay.config.shipping && !window.NanoPay.config.mailing_address) return alert('Shipping Address Required.')
    	window.open(`nano:${window.NanoPay.checkout.address}?amount=${window.NanoPay.checkout.amount}`, '_self')
    	// window.open(`nano:${window.NanoPay.checkout.address}?amount=${window.NanoPay.checkout.amount}`, '_blank')
    }

    window.NanoPay.open = async (config) => {

    	config = config || window.NanoPay.config

    	// if (window.NanoPay.config) window.NanoPay.close()
    	if (!window.NanoPay.config && config) window.NanoPay.config = config

    	var background = config.background || (window.NanoPay.dark_mode ? '#353535' : 'rgb(247, 247, 247)')
    	var backdrop_background = config.backdrop || (window.NanoPay.dark_mode ? '#3f3f3fe0' : 'rgb(142 142 142 / 93%)')
    	var text_color = config.text || (window.NanoPay.dark_mode ? '#FFF' : '#000')
    	var position = config.position || 'bottom'
    	var button = config.button || 'Open Natrium'
    	var symbol = config.symbol || 'NANO'
    	var description = config.description || config.text || config.title || 'TOTAL'
    	var address = config.address
    	var amount = config.amount ? Number(config.amount) : ''
    	var random = config.random || config.random === false || config.random === "false" ? config.random : true
    	var notify = config.notify

    	if (!address) return alert("NanoPay: Address or Username required.")
    	if (!amount) return alert("NanoPay: Amount required.")

    	if (config.shipping !== true && Number(config.shipping)) amount += Number(config.shipping)

		window.NanoPay.checkout = (await window.NanoPay.RPC.post('https://rpc.nano.to', { 
			action: "checkout", 
			address, 
			amount, 
			random,
			notify,
			checkout: true 
		}, { headers: { 'nano-app': `fwd/nano-pay:${version}` } }))

		if (!window.NanoPay.checkout.amount) {
			return alert("NanoPay: " + window.NanoPay.checkout.message)
		}

		var amount_raw = window.NanoPay.amount
		address = window.NanoPay.address

    	var strings = {
    		email: config.strings && config.strings.email ? config.strings.email : 'Email',
    		shipping: config.strings && config.strings.shipping ? config.strings.shipping : 'Shipping',
    		tax: config.strings && config.strings.tax ? config.strings.tax : 'Sales Tax',
    		subtotal: config.strings && config.strings.subtotal ? config.strings.subtotal : 'Subtotal',
    		button: config.strings && config.strings.button ? config.strings.button : 'Pay with Nano',
    	}

    	// looks better
    	if (!config.position && window.innerWidth > 1024) position = 'top'

		// Example usage
		var cssContent = `
		    #nano-pay { font-family: 'Arial'; position: fixed;width: 100%;z-index: 9999;left: 0;top: 0;right: 0;bottom: 0;display: flex;align-items: center;justify-content: center;flex-direction: column;font-size: 15px; }
			
			#nano-pay-backdrop { background: ${backdrop_background}; width: 100%; height: 100%;  }
			
			#nano-pay-body { width: 100%;max-width: 420px;display: flex;flex-direction: column;justify-content: center;align-items: center;background:${background};position: absolute;transition: all 0.3s ease 0s;color:${text_color};box-shadow: 1px 1px 7px #0003; }

			#nano-pay-header { display: flex; align-items: center; }
			#nano-pay-header > img { max-width: 22px; }
			#nano-pay-header > span { display: block;margin-left: 4px;font-size: 106%; }
			#nano-pay-header-container { width: 100%;display: flex;align-items: center;justify-content: space-between;padding: 14px;border-bottom: 1px solid #0000000f; }
			#nano-pay-cancel { color: #1f9ce9 }
			#nano-pay-shipping { display: flex;justify-content: start;width: 100%;padding: 15px 14px;border-bottom: 1px solid #0000000f;position: relative;align-items: center; }
			#nano-pay-shipping svg { max-width: 23px;fill: #1f9ce9;position: absolute;right: 5px;top: 0px;bottom: 0;margin: auto; }
			#nano-pay-shipping-label {  text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.5;  min-width: 90px; font-size: 90% }

			#nano-pay-contact { display: flex;justify-content: start;width: 100%;padding: 15px 14px;border-bottom: 1px solid #0000000f;position: relative;align-items: center; }
			#nano-pay-contact-label {  text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.5; min-width: 90px;  font-size: 90%  }
			#nano-pay-contact svg {  max-width: 23px;fill: #1f9ce9;position: absolute;right: 5px;top: 0px;bottom: 0;margin: auto; }

			#nano-pay-details { display: flex;justify-content: start;width: 100%;padding: 15px 14px;border-bottom: 1px solid #0000000f;position: relative;align-items: start; }

			#nano-pay-details-spacer { text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.5; min-width: 90px; }
			#nano-pay-details-labels { text-transform: uppercase;opacity: 0.5;font-size: 90%;line-height: 17px;letter-spacing: 0.8px; }
			#nano-pay-details-values { text-transform: uppercase;opacity: 1;font-size: 90%;line-height: 17px;letter-spacing: 0.8px; margin-left: auto; }

			#nano-pay-button { display: flex; flex-direction: column; align-items: center; margin: 15px 0 18px 0; text-decoration: none; color: inherit; text-align: center;  }

			#nano-pay-button span {  margin-top: 10px; display: block; opacity: 0.5; font-size: 85%;  }
		`;

		if (position === 'bottom') {
			cssContent += `#nano-pay-body { bottom: -100%; border-bottom-left-radius: 0; border-bottom-right-radius: 0; border-top-left-radius: 5px; border-top-right-radius: 5px; }`
		}

		if (position === 'center') {
			cssContent += `#nano-pay-body { top: auto; bottom: auto; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; border-top-left-radius: 5px; border-top-right-radius: 5px; }`
		}

		if (position === 'top') {
			cssContent += `#nano-pay-body { top: -100%; bottom: auto; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px; border-top-left-radius: 0; border-top-right-radius: 0; }`
		}

		addStyleIfNotExists(cssContent);

		window.NanoPay.config.contact_email = config.email || localStorage.getItem('nano-pay-contact-email')
		window.NanoPay.config.mailing_address = config.mailing_address || localStorage.getItem('nano-pay-mailing-address')

		var template = `
		<div id="nano-pay">

			<div id="nano-pay-backdrop" onclick="window.NanoPay.close(); return"></div>

		    <div id="nano-pay-body">
					
				<div id="nano-pay-header-container"> 
					<div id="nano-pay-header">
						<img src="https://pay.nano.to/img/xno.svg"> 
						<span>Pay</span> 
					</div>

					<div id="nano-pay-cancel" onclick="window.NanoPay.close(); return"> Cancel </div> 
				</div>

				<div style="display: ${config.contact ? 'flex' : 'none'}" onclick="window.NanoPay.configEmailAddress()" id="nano-pay-contact"> 
					<div id="nano-pay-contact-label">${strings.email}</div> 
					<div id="nano-pay-user-contact-email" style="line-height: 1.1; opacity: ${window.NanoPay.config.contact_email ? '1' : '0.5'}">${window.NanoPay.config.contact_email || 'N/A'}</div> 
					<svg id="Layer_1" version="1.1" viewBox="0 0 512 512" width="512px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon points="160,115.4 180.7,96 352,256 180.7,416 160,396.7 310.5,256 "></polygon></svg> 
				</div>
				
				<div style="display: ${Number(config.shipping) ? 'flex' : 'none'}" onclick="window.NanoPay.configMailingAddress()" id="nano-pay-shipping"> 
					<div id="nano-pay-shipping-label">${strings.shipping}</div> 
					<div id="nano-pay-user-mailing-address" style="line-height: 1.1; opacity: ${window.NanoPay.config.mailing_address ? '1' : '0.5'}">${window.NanoPay.config.mailing_address || 'N/A'}</div> 
					<svg id="Layer_1" version="1.1" viewBox="0 0 512 512" width="512px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon points="160,115.4 180.7,96 352,256 180.7,416 160,396.7 310.5,256 "></polygon></svg> 
				</div>

				<div id="nano-pay-details"> 
					<div style="display: ${config.shipping ? 'block' : 'none'}" id="nano-pay-details-spacer"></div>
					<div id="nano-pay-details-labels">
						<div style="display: ${config.shipping !== true && Number(config.shipping) ? 'block' : 'none'}">${strings.subtotal}</div>  
						<div style="display: ${config.shipping !== true && Number(config.shipping) ? 'block' : 'none'}">${strings.shipping}</div>  
						<br style="display: ${config.shipping !== true && Number(config.shipping) ? 'block' : 'none'}">
						<div>${description}</div>  
					</div>  
					<div id="nano-pay-details-values">
						<div style="display: ${config.shipping !== true && Number(config.shipping) ? 'block' : 'none'}">${config.amount} ${symbol}</div>   
						<div style="display: ${config.shipping !== true && Number(config.shipping) ? 'block' : 'none'}">${config.shipping} ${symbol}</div>   
						<br style="display: ${config.shipping !== true && Number(config.shipping) ? 'block' : 'none'}"> 
						<div>${window.NanoPay.checkout.amount_nano} ${symbol}</div>   
					</div> 
				</div>

			    <a id="nano-pay-button" onclick="window.NanoPay.submit()"> 
			    	<img id="nano-pay-button-image" src="https://pay.nano.to/img/natrium.png" style="max-width: 45px;"> 
			    	<span id="nano-pay-button-text">${button}</span> 
			    </a>
		    </div>
		</div>`

	    document.body.innerHTML += template;
	    
	    setTimeout(() => {
	    	document.body.style.overflow = 'hidden';
	    	if (position === 'top') document.getElementById('nano-pay-body').style.top = "0"; 
	    	if (position === 'top' || position === 'center') document.getElementById('nano-pay-body').style.bottom = "auto"; 
	    	if (position === 'bottom') document.getElementById('nano-pay-body').style.bottom = "0"; 
	    }, 100)

	    var checks = 0
	    var checking = false
	    var viewing_page = true
	    var required_information = false


		if (document.visibilityState) {
		  document.addEventListener('visibilitychange', function() {
		    if (document.visibilityState === 'visible') {
		      viewing_page = true
		    } else {
		      viewing_page = false
		    }
		  });
		}

		var delay = window.innerWidth < 1020 ? 1000 : 5000

	    window.NanoPay.interval = setInterval(async () => {
	    	if (!window.NanoPay.checkout || !window.NanoPay.config || window.NanoPay.config.debug) return
		    if (window.NanoPay.config.shipping && !window.NanoPay.config.mailing_address) return
		    if (window.NanoPay.config.contact && !window.NanoPay.config.contact_email) return
	    	if (!viewing_page) return
	    	if (checking) return
	    	if (checks < 60) {
	    		checking = true
		    	var block = (await window.NanoPay.RPC.post(window.NanoPay.checkout.check, { 
		    		note: window.NanoPay.config.note || window.NanoPay.config.title,
		    		source: window.location.origin,
		    		shipping: window.NanoPay.config.mailing_address,
		    		email: window.NanoPay.config.contact_email,
		    		products: window.NanoPay.config.products || window.NanoPay.config.line_items,
		    	}))
		    	checking = false
		    	if (block && block.block) {
			    	var success_el = document.getElementById('nano-pay-button-image') 
			    	var success_text = document.getElementById('nano-pay-button-text')
			    	success_el.style.maxWidth = '65px'
			    	success_el.src = 'https://pay.nano.to/img/success.gif'
			    	success_el.style.filter = 'hue-rotate(40deg)'
			    	success_el.style.filter = 'hue-rotate(115deg)' // blue
			    	success_text.style.display = 'none'
		    		if (config.success) {
				    	setTimeout(async () => {
			    			if ( config.success.constructor.name === 'AsyncFunction' ) await config.success(block)
			    			if ( config.success.constructor.name !== 'AsyncFunction' ) config.success(block)
			    		}, 100)
		    		}
		    		setTimeout(() => {
		    			window.NanoPay.close()
		    		}, 2000)
		    		clearInterval(window.NanoPay.interval)
		    		return
		    	}
	    	} else clearInterval(window.NanoPay.interval)
	    }, delay)

    }

    window.NanoPay.configMailingAddress = () => {
    	var shipping = window.prompt('Shipping Address: ')
    	if (shipping) {
    		if (window.NanoPay.config.localstorage !== false) localStorage.setItem('nano-pay-mailing-address', shipping)
    		window.NanoPay.config.mailing_address = shipping
    		document.getElementById('nano-pay-user-mailing-address').innerText = shipping
    	}
    }

    window.NanoPay.configEmailAddress = () => {
    	const validateEmail = (email) => {
		  return email.match(
		    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		  );
		}
    	var email = window.prompt('Email Address: ')
    	if (email) {
    		if (!validateEmail(email)) {
    			return alert('Invalid email address. Try again.')
    		}
    		if (window.NanoPay.config.localstorage !== false) localStorage.setItem('nano-pay-contact-email', email)
    		window.NanoPay.config.contact_email = email
    		document.getElementById('nano-pay-user-contact-email').innerText = email
    	}
    }

    window.NanoPay.init = async (config) => {

    	config = config || {}
        
        var all = document.querySelectorAll(config.element || '[data-amount]');

        if (all.length) {
	
	        for (var i=0, max=all.length; i < max; i++) {

	            var item = all[i]

				config = {
					title: item.getAttribute('data-title'),
					amount: item.getAttribute('data-amount'),
					address: item.getAttribute('data-address') || item.getAttribute('data-name'),
					shipping: item.getAttribute('data-shipping') || false,
					contact: item.getAttribute('data-contact') || false,
					position: item.getAttribute('data-position') || false,
					button: item.getAttribute('data-button') || false,
					notify: item.getAttribute('data-notify') || false,
				}

				var original_text =  all[i].innerText

	            all[i].innerHTML = ''
	            
	            let code = `<div onclick="window.NanoPay.open()" style="cursor: pointer;padding: 7px 25px;border-radius: 4px;margin: 15px 0 10px 0;display: flex;align-items: center;justify-content: center;background: #ffffff;font-family: Helvetica, 'Arial';letter-spacing: 1px;min-height: 48px; color: ${config.color || '#000'}">
	        		<img style="max-width: 24px;width: auto;min-width: auto;margin: 0 8px 0 0!important;float: none;" src="https://pay.nano.to/img/xno.svg" alt="">${ original_text || strings.button }</div>`

	            code += '</div>'

	            item.innerHTML += code

	            window.NanoPay.config = config

	        }

        } else {
        	window.NanoPay.config = config
        }

    }

})();

if (document.querySelectorAll('[data-amount]').length) window.NanoPay.init()