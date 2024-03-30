// NanoPay 1.1.6
// March 18, 2024
// https://github.com/fwd/NanoPay
// (c) @nano2dev <support@nano.to>
// Released under MIT License
;(async () => {

	let nanopay_loading = false
	let original_config = false
	let payment_success = false
	let locked_content = {}
	let rpc_checkout = {}
	let wall_success = null
	let desktop_width = 960
	window.check_interval = false
	window.expiration_interval = false

	if (window.NanoPay === undefined) window.NanoPay = { version: '1.1.6', support: 'support@nano.to' }

	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		window.NanoPay.dark_mode = true
	}

	let RPC = {

		get(endpoint) {
			return new Promise((resolve) => {
			    var xhr = new XMLHttpRequest();
			    xhr.open("GET", endpoint, true);
			    xhr.setRequestHeader('nano-app', `fwd/nano-pay-${window.NanoPay.version}`);
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
			    xhr.setRequestHeader('content-type', 'application/json');
			    xhr.setRequestHeader('nano-app', `fwd/nano-pay-${window.NanoPay.version}`);
			    xhr.send(JSON.stringify(data));
			    xhr.onload = function() {
			      resolve(JSON.parse(this.responseText))
			    }
			})
		},

	}

	function addStyleIfNotExists(cssContent) {
	    var styles = document.head.getElementsByTagName('style');
	    var styleExists = false;
	    for (var i = 0; i < styles.length; i++) {
	        if (styles[i].textContent.trim() === cssContent.trim()) {
	            styleExists = true;
	            break;
	        }
	    }
	    if (!styleExists) {
	        var style = document.createElement('style');
	        style.textContent = cssContent;
	        document.head.appendChild(style);
	    }
	}

	window.NanoPay.CopyToClipboard = function(text, el) {
	    navigator.clipboard.writeText(rpc_checkout[text]).then(function() {
			var span = el.getElementsByTagName("span")
			if (span) {
				var default_text = span[0].innerText
				span[0].innerText = 'Copied!'
				setTimeout(() => span[0].innerText = default_text, 2000)
			}
	    }, function() {
	        document.execCommand("copy");
	    })
	}

	window.NanoPay.update_description = (text) => {
		document.getElementById('nano-pay-description').innerText = text
	}

	function countdownTimer(duration, onTick, onComplete) {
		let timeLeft = duration;
		window.expiration_interval = setInterval(() => {
			const minutes = Math.floor(timeLeft / 60);
			const seconds = timeLeft % 60;
			if (timeLeft <= 0) {
			  clearInterval(window.expiration_interval);
			  onComplete();
			} else {
			  onTick(minutes, seconds);
			  timeLeft--;
			}
		}, 1000);
	}

	window.NanoPay.onchange_select_one = (e) => {
		plan = rpc_checkout.plans[e.value.split(',')[0]]
		if (!plan) return alert("NanoPay: Checkout Error. Please contact support@nano.to with error code #109")
		rpc_checkout.amount = plan.value
		rpc_checkout.amount_raw = plan.value_raw
		document.getElementById('nano-pay-amount-value').innerText = `${rpc_checkout.amount} ${e.value.split(',')[1]}`
		document.getElementById('nano-pay-copy-clipboard-amount').innerText = `${ String(rpc_checkout.amount).length > 7 ? String(rpc_checkout.amount).slice(0, 7) + '..' : String(rpc_checkout.amount) } ${e.value.split(',')[1]}`
		document.getElementById('nano-pay-qrcode-image').src = plan.qrcode
	}

	window.NanoPay.onchange_custom_input_one = (e) => {
		window.NanoPay.config.provided_alias = e.value
		if (e.value && (window.innerWidth > desktop_width || window.NanoPay.config.qrcode)) document.getElementById('nano-pay-qrcode').style.display = 'flex'
		if (!e.value) document.getElementById('nano-pay-qrcode').style.display = 'none'
	}

	window.NanoPay.unlock_request = async (title, element, amount, address, notify, elementId) => {
		if (!original_config) return
		if (original_config.seriesId && original_config.seriesId !== elementId) return
		if (original_config.notify && original_config.notify !== notify) return
		if (original_config.element !== element) return
		if (Number(original_config.amount) !== Number(amount)) return
		if (original_config.address !== address) return
		window.NanoPay.close()
		window.NanoPay.open({
			title,
			amount,
			description: original_config.description,
			address,
			notify,
			success: (block) => window.NanoPay.unlock_content(element, elementId, block)
		})
	}

	function getStringBetween(string, start, end) {
	    var startIndex = string.indexOf(start);
	    if (startIndex === -1) return '';
	    startIndex += start.length;
	    var endIndex = string.indexOf(end, startIndex);
	    if (endIndex === -1) return '';
	    return string.substring(startIndex, endIndex);
	}

	window.NanoPay.unlock_content = async (element, elementId, block, delay) => {

		if (!element) return
		if (!payment_success) return
		
		setTimeout(() => {

			var all = document.querySelectorAll(element);

	        for (var i=0, max=all.length; i < max; i++) {
	        	if (original_config.decode) {
	        		var body = getStringBetween(locked_content[i], 'PREMIUM-ARTICLE-A', '+HRT')
	        		if (body) all[i].innerHTML = locked_content[i].replace('PREMIUM-ARTICLE-A' + body + '+HRT', atob(body))
	        		else all[i].innerHTML = locked_content[i]
	        	} else {
	            	all[i].innerHTML = locked_content[i]
	        	}
	            all[i].style.position = null
	            all[i].classList.add("unlocked")
	            all[i].style.display = original_config.display || 'block'
	        }

	        var locked = document.querySelectorAll('.nano-locked');

	        for (var i = 0, max = locked.length; i < max; i++) {
	        	if ( locked[i] ) locked[i].remove()
	        }
    		
    		if (elementId) localStorage.setItem(elementId, true)
    		
    		if (wall_success) wall_success(block, element, elementId)

		}, delay === false ? 0 : 1900)

	}

	window.NanoPay.wall = async (config) => {

        config = config || {}

        if (!config.element) return console.error('NanoPay: No premium element provided:', config.element)
        if (!config.address) return console.error('NanoPay: No address provided:', config.address)
        if (!config.amount) return console.error('NanoPay: No price provided:', config.amount)

        if (config.endpoint || config.node) window.nano.rpc.endpoint = config.endpoint || config.node
        if (config.debug) window.nano.debug = config.debug 
        if (config.success) window.user_success = config.success 
        
        var all = document.querySelectorAll(config.element);

    	if (config.success) wall_success = config.success

    	original_config = config

    	var buttonCSS = `.nano-pay-unlock-button { cursor: pointer;padding: 7px 25px;border-radius: 4px;margin: 15px 0 10px 0;display: flex;align-items: center;justify-content: center;background: #ffffff;font-family: Helvetica, 'Arial';letter-spacing: 1px;min-height: 48px; color: ${config.color || '#000'} }
    		.nano-pay-unlock-button img { max-width: 24px;width: auto;min-width: auto;margin: 0 8px 0 0!important;float: none; }
    		.nano-pay-free-read { text-align: center }
    		.nano-pay-free-read hr { margin: 20px 0 15px 0; }`

    	addStyleIfNotExists(buttonCSS);

        for (var i=0, max=all.length; i < max; i++) {

            var item = all[i]

            var articleId = config.seriesId || window.location.pathname + '-' + item.tagName + '-' + i

            locked_content[i] = item.innerHTML
        	
        	if (localStorage.getItem(articleId)) {
        		payment_success = true
        		window.NanoPay.unlock_content(config.element, null, null, false)
        		return
        	}

            var code = `<div onclick="window.NanoPay.unlock_request('${config.title || 'Pay'}', '${config.element}', '${config.amount}', '${config.address}', '${config.notify}', '${articleId}')" class="nano-pay-unlock-button"><img style="" src="https://wall.nano.to/img/xno.svg" alt="">${ config.button || 'Unlock with Nano' }</div></div>`

            if (config.free) {
            	payment_success = true
                code += `<div class="nano-pay-free-read" onclick="window.NanoPay.unlock_content('${config.element}')"><hr>${ config.free_text ? config.free_text : 'Free Read' }</div>`
            } 

            all[i].innerHTML = code

            item.style.display = config.display || 'block'

        }

    }

    window.NanoPay.close = (element) => {
    	document.body.style.overflow = 'auto';
        if (document.getElementById('nano-pay')) document.getElementById('nano-pay').remove()
        clearInterval(window.check_interval)
		window.check_interval = false
		clearInterval(window.expiration_interval)
		window.expiration_interval = false
		payment_success = false
		rpc_checkout = null
		localStorage.removeItem('NanoPayCheckoutId')
    }

    window.NanoPay.cancel = async (element) => {
    	document.body.style.overflow = 'auto';
        document.getElementById('nano-pay').remove()
        clearInterval(window.check_interval)
        window.check_interval = false
        clearInterval(window.expiration_interval)
        window.expiration_interval = false
        if (window.NanoPay.config && window.NanoPay.config.cancel) {
	        if ( window.NanoPay.config.cancel && window.NanoPay.config.cancel.constructor.name === 'AsyncFunction' ) await window.NanoPay.config.cancel()
			if ( window.NanoPay.config.cancel && window.NanoPay.config.cancel.constructor.name !== 'AsyncFunction' ) window.NanoPay.config.cancel()
        }
    	localStorage.removeItem('NanoPayCheckoutId')
    }

    window.NanoPay.submit = async (config) => {

    	if (window.NanoPay.config && window.NanoPay.config.submit) {
    	
    		var body = { 
    			address: rpc_checkout.address, 
    			amount: rpc_checkout.amount, 
    			amount_raw: rpc_checkout.amount_raw,
    			alias: window.NanoPay.config.provided_alias,
    			email: window.NanoPay.config.contact_email,
    			shipping: window.NanoPay.config.mailing_address,
    		}

    		var submit = window.NanoPay.config.submit

	        if ( submit.constructor.name === 'AsyncFunction' ) await submit(body)
			if ( submit.constructor.name !== 'AsyncFunction' ) submit(body)
		
			return

        } else {
		  
		    if (window.NanoPay.config.require_alias && !window.NanoPay.config.provided_alias) return alert('Address alias required.')
		    if (window.NanoPay.config.contact && !window.NanoPay.config.contact_email) return alert('Email address required.')
		    if (window.NanoPay.config.shipping && !window.NanoPay.config.mailing_address) return alert('Shipping address required.')
		    
	    	window.open(`nano:${rpc_checkout.address}?amount=${rpc_checkout.amount_raw}`, '_self')
        
        }

    }

    window.NanoPay.open = async (config) => {

    	config = config || window.NanoPay.config

    	if (typeof config === 'string' && config.includes('el-')) {
    		config = window.NanoPay.el[Number(config.replace('el-', ''))]
    	}

    	if (!window.NanoPay.config && config) window.NanoPay.config = config

    	var background = config.background || (window.NanoPay.dark_mode ? '#282c37' : 'rgb(247, 247, 247)')
    	var backdrop_background = config.backdrop || (window.NanoPay.dark_mode ? '#1f1e1ee0' : 'rgb(142 142 142 / 93%)')
    	var text_color = config.text || (window.NanoPay.dark_mode ? '#FFF' : '#000')
    	var position = config.position || 'bottom'
    	var button = config.button || 'Open'
    	var symbol = config.symbol || 'NANO'
    	var description = config.description || config.text || config.note || config.memo || 'AMOUNT'
    	var address = config.address
    	var amount = config.amount ? Number(config.amount) : undefined
    	var random = config.random || config.random === false || config.random === "false" ? config.random : true
    	var notify = config.notify
    	var line_items = config.line_items || config.items || config.products
    	var currency = config.currency
    	var public_key = config.public_key || config.key
    	var custom_css = config.css || config.custom_css
    	var qrcode = config.qr || config.qrcode
    	var node = config.node || config.rpc || config.endpoint || 'https://rpc.nano.to'
    	var checkout = config.checkout || config.url
    	var wallet = config.wallet ? config.wallet.toLowerCase() : 'natrium'
    	var get_alias = config.alias || config.get_alias
    	var get_name = config.claim || config.lease || config.name || config.get_name || config.username
    	var disclaimer = config.disclaimer
    	var expiration = config.timeout || config.expiration || config.time || config.time
    	var service_fee = config.fee || config.service_fee

    	var wallets = {
    		nault: { image: 'https://pay.nano.to/img/nault.png', name: 'Nault' },
    		natrium: { image: 'https://pay.nano.to/img/natrium.png', name: 'Natrium' },
    		nautilus: { image: 'https://pay.nano.to/img/nautilus.png', name: 'Nautilus' },
    		cake: { image: 'https://pay.nano.to/img/cake.png', name: 'Cake Wallet' },
    	}

    	var strings = {
    		line_items: config.strings && config.strings.line_items ? config.strings.line_items : (config.line_items && config.line_items.length > 1 ? 'Items' : 'Item'),
    		email: config.strings && config.strings.email ? config.strings.email : 'Email',
    		shipping: config.strings && config.strings.shipping ? config.strings.shipping : 'Shipping',
    		service_fee: config.strings && config.strings.shipping ? config.strings.shipping : 'Service Fee',
    		tax: config.strings && config.strings.tax ? config.strings.tax : 'Sales Tax',
    		subtotal: config.strings && config.strings.subtotal ? config.strings.subtotal : 'Subtotal',
    		button: config.strings && config.strings.button ? config.strings.button : 'Pay with Nano',
    		quantity: config.strings && config.strings.quantity ? config.strings.quantity : 'Amount',
    		alias: config.strings && config.strings.alias ? config.strings.alias : 'Your Alias',
    		account: config.strings && config.strings.account ? config.strings.account : 'Account',
    		email_placeholder: config.strings && config.strings.email_placeholder ? config.strings.email_placeholder : 'N/A',
    		shipping_placeholder: config.strings && config.strings.shipping_placeholder ? config.strings.shipping_placeholder : 'N/A',
    	}

    	function show_loading(bool) {
    		if (bool) {
				var loaderCSS = `#nano-pay-backdrop-initial { background: ${backdrop_background}; width: 100%; height: 100%; position: fixed; z-index: 99999999; top: 0; opacity: 0.7; background-image: url('https://pay.nano.to/img/loader.gif'); background-size: 50px; background-position: center; background-repeat: no-repeat; }`
				addStyleIfNotExists(loaderCSS)
				var loadingDiv = document.createElement('div');
				loadingDiv.id = 'nano-pay-backdrop-initial';
				document.body.appendChild(loadingDiv);
    		} else {
    			document.getElementById("nano-pay-backdrop-initial").remove();
    		}
			nanopay_loading = bool
		}

		show_loading(true)

    	if (!wallets[wallet]) {
    		show_loading(false)
    		return alert("NanoPay: Invalid wallet option. Supported: natrium, nault, nautilus, cake.")
    	}

    	if (config.contact === "false") config.contact = false

    	if (checkout) {
    		
    		if (checkout.id) {
    			rpc_checkout = checkout
    		} else {
	    		var checkout_url = checkout.replace('https://api.nano.to/checkout/', '')
	    		rpc_checkout = (await RPC.get(`https://api.nano.to/checkout/${checkout_url}`, { headers: { 'nano-app': `fwd/nano-pay-${window.NanoPay.version}` } }))
    		}

    		if (rpc_checkout.plans) {
    			var default_plan = config.default || config.plan || 1
				rpc_checkout.amount = rpc_checkout.plans[default_plan].value
				rpc_checkout.amount_raw = rpc_checkout.plans[default_plan].value_raw
				rpc_checkout.qrcode = rpc_checkout.plans[default_plan].qrcode
    		}

    		if (rpc_checkout.description) description = rpc_checkout.description
    		if (rpc_checkout.symbol) window.NanoPay.config.symbol = rpc_checkout.symbol
    		if (rpc_checkout.shipping) window.NanoPay.config.shipping = rpc_checkout.shipping
    		if (rpc_checkout.contact) window.NanoPay.config.contact = rpc_checkout.contact

    	} else {

    		if (get_name) {

    			if (get_name === true || get_name === 'true') get_name = window.prompt('Username: ')

				rpc_checkout = (await RPC.post('https://api.nano.to', {
				    action: 'get_name',
				    username: get_name,
				    qrcode: true
				}))

				if (rpc_checkout.available === false) {
					config.disclaimer = 'Username taken. Only original owner can add time.'
				}

				if (rpc_checkout.error) {
					show_loading(false)
					return alert("NanoPay: " + rpc_checkout.message || rpc_checkout.error)
				}

    			var default_plan = 1
				rpc_checkout.amount = rpc_checkout.plans[default_plan].value
				rpc_checkout.amount_raw = rpc_checkout.plans[default_plan].value_raw
				rpc_checkout.qrcode = rpc_checkout.plans[default_plan].qrcode
				strings.quantity = 'Duration'
				config.title = 'Name'
				description = '@' + rpc_checkout.lease

    		} else if (get_alias) {

    			rpc_checkout = (await RPC.post('https://api.nano.to', { 
    				action: 'get_alias', 
    				amount: config.amount,
    				address: config.address
    			}))

    			if (rpc_checkout.error) {
    				show_loading(false)
    				return alert("NanoPay: " + rpc_checkout.message || rpc_checkout.error)
    			}

    			window.NanoPay.config.require_alias = true

    			if (!config.disclaimer) config.disclaimer = 'The address you pay with will be associated with this alias. If address already has alias, it will be updated.'

    			if (!config.memo && !config.note) description = 'Register Alias'

    		} else {

		    	if (!address) {
		    		show_loading(false)
		    		return alert("NanoPay: Address or Username required.")
		    	}

		    	if (line_items) {
		    		if (!Array.isArray(line_items) || line_items && !line_items.find(a => a && a.price)) {
		    			show_loading(false)
		    			return alert("NanoPay: Invalid line_items. Example: [ { name: 'T-Shirt', price: 5 } ] ")
		    		}
		    		description = original_config.description || 'TOTAL'
		    	}

				rpc_checkout = (await RPC.post(node, { 
					action: "checkout", 
					line_items, 
					shipping: Number(config.shipping) ? config.shipping : undefined, 
					currency, 
					address, 
					amount, 
					random,
					notify,
					public_key
				}))

    		}

    	}

		if (amount && !rpc_checkout.amount_raw) {
			alert("NanoPay: " + rpc_checkout.message || 'Checkout Error. Please contact support@nano.to with error code #112')
			show_loading(false)
			return 
		}

		if (!config.plans && !config.line_items && !get_alias && !get_alias) {
			config.account = config.address
		}

    	// looks better
    	if (!config.position && window.innerWidth > desktop_width) {
    		position = 'top'
    		if (!config.wallet) wallet = 'nault'
    	}

    	if (!config.button) button = button + ' ' + wallets[wallet].name

		var cssContent = `
		    #nano-pay { font-family: sans-serif; font-family: 'Arial'; position: fixed;width: 100%;z-index: 9999;left: 0;top: 0;right: 0;bottom: 0;display: flex;align-items: center;justify-content: center;flex-direction: column;font-size: 15px; }
			
			#nano-pay-backdrop { background: ${backdrop_background}; width: 100%; height: 100%;  }
			
			#nano-pay-body { width: 100%;max-width: 420px;display: flex;flex-direction: column;justify-content: center;align-items: center;background:${background}; position: absolute;transition: all 0.3s ease 0s;color:${text_color};box-shadow: 1px 1px 7px #0003; letter-spacing: 0.2px; bottom: ${position === 'bottom' ? '-100%' : 'auto'}; top: ${position === 'top' ? '-100%' : 'auto'} }

			#nano-pay-header { display: flex; align-items: center; }
			#nano-pay-header > svg { max-width: 22px; height: 22px }
			#nano-pay-header > span { display: block;margin-left: 4px;font-size: 106%; }
			#nano-pay-header-container { box-sizing: border-box; width: 100%;display: flex;align-items: center;justify-content: space-between;padding: 14px;border-bottom: 1px solid ${ window.NanoPay.dark_mode ? '#ffffff08' : '#0000000f' }; }
			#nano-pay-cancel { color: #1f9ce9 }

			#nano-pay-shipping { box-sizing: border-box; display: flex;justify-content: start;width: 100%;padding: 15px 14px;border-bottom: 1px solid ${ window.NanoPay.dark_mode ? '#ffffff08' : '#0000000f' };position: relative;align-items: center; }
			#nano-pay-shipping svg { max-width: 23px;fill: #1f9ce9;position: absolute;right: 5px;top: 0px;bottom: 0;margin: auto; }
			#nano-pay-shipping-label {  text-transform: uppercase; letter-spacing: 0.7px; opacity: 0.5;  min-width: 90px; font-size: 90% }

			#nano-pay-contact { box-sizing: border-box; display: flex;justify-content: start;width: 100%;padding: 15px 14px;border-bottom: 1px solid ${ window.NanoPay.dark_mode ? '#ffffff08' : '#0000000f' };position: relative;align-items: center; }
			#nano-pay-contact-label { text-transform: uppercase; letter-spacing: 0.7px; opacity: 0.5; min-width: 90px; font-size: 85%  }
			#nano-pay-description { font-size: 90% }
			#nano-pay-contact svg {  max-width: 23px;fill: #1f9ce9;position: absolute;right: 5px;top: 0px;bottom: 0;margin: auto; }

			#nano-pay-details { box-sizing: border-box; display: flex;justify-content: start;width: 100%;padding: 15px 14px;border-bottom: 1px solid ${ window.NanoPay.dark_mode ? '#ffffff08' : '#0000000f' };position: relative;align-items: start; }

			#nano-pay-details-spacer { text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.5; min-width: 90px; }
			#nano-pay-details-labels { font-family: sans-serif; opacity: 0.5;font-size: 95%;line-height: 17px;letter-spacing: 0.8px; }
			#nano-pay-details-labels > div, #nano-pay-details-values > div { margin: 3px 0; }
			#nano-pay-details-values { text-transform: uppercase;opacity: 1;font-size: 90%;line-height: 17px;letter-spacing: 0.8px; margin-left: auto; }

			#nano-pay-submit { cursor: pointer; display: flex; flex-direction: column; align-items: center; margin: 15px 0 18px 0; text-decoration: none; color: inherit; text-align: center;  }

			#nano-pay-submit span {  margin-top: 10px; display: block; opacity: 0.7; font-size: 85%;  }

			#nano-pay-qrcode { display: flex;width: 100%;justify-content: center;border-bottom: 1px solid ${ window.NanoPay.dark_mode ? '#ffffff08' : '#0000000f' };padding-bottom: 20px; align-items: center; flex-direction: column }
			#nano-pay-qrcode-image {max-width: 140px; margin-top: 20px; border-bottom: 1px solid ${ window.NanoPay.dark_mode ? '#ffffff08' : '#0000000f' }; background: #FFF; padding: 5px; border-radius: 5px;}

			#nano-pay-select-one, #nano-pay-custom-input-one { color: inherit; max-width: 285px; min-width: 135px; background: transparent; border: 1px solid ${ window.NanoPay.dark_mode ? '#ffffff12' : '#00000045' }; height: 30px; border-radius: 5px; padding: 0 3px; }

			#nano-pay-custom-input-one { min-width: 230px; }

			#nano-pay-disclaimer { justify-content: center; word-break: break-word; box-sizing: border-box; display: flex; padding: 10px 20px;background: ${ window.NanoPay.dark_mode ? '#333846' : '#e4e4e4' }; text-align: center;font-size: 14px;width: 100%; }

			#nano-pay-copy-address { display: flex }

			.nano-pay-copy-clipboard { background: ${ window.NanoPay.dark_mode ? '#323846' : '#e4e4e4' }; display: flex; min-width: 160px; align-items: center; justify-content: center; padding: 5px; border-radius: 5px; margin: 15px 10px 0 10px; cursor: pointer; zoom: 0.9 }
			
			#nano-pay-copy-address .nano-pay-copy-clipboard:last-child { margin: 15px 5px 0 10px; }

			.nano-pay-copy-clipboard svg { max-width: 15px; margin-left: 10px; ${ window.NanoPay.dark_mode ? 'filter: invert(1)' : '' } }

			${custom_css}

		`;

		if (position === 'bottom') {
			cssContent += `#nano-pay-body { 
				top: auto;
				bottom: -100%; 
				border-bottom-left-radius: 0; 
				border-bottom-right-radius: 0; 
				border-top-left-radius: 5px; 
				border-top-right-radius: 5px; 
			}`
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

		var template = `<div id="nano-pay-backdrop" onclick="window.NanoPay.cancel(); return"></div>

<div id="nano-pay-body">
		
	<div id="nano-pay-header-container"> 
		<div id="nano-pay-header">
			<svg width="1080" height="1080" viewBox="0 0 1080 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
			<circle cx="540" cy="540" r="540" fill="#209CE9"/>
			<path d="M792.911 881H740.396L541.099 570.561L338.761 881H286.68L513.452 529.3L306.882 206.222H360.42L541.95 490.393L727.322 206.222H777.555L568.762 528.379L792.911 881Z" fill="white"/>
			<path d="M336.487 508.737H744.807V547.116H336.487V508.737ZM336.487 623.872H744.824V662.251H336.47L336.487 623.872Z" fill="white"/>
			</svg>
			<span>${config.title || 'Pay'}</span> 
		</div>
		
		<div id="nano-pay-cancel" onclick="window.NanoPay.cancel(); return">Cancel</div> 
	</div>
	
	<div style="display: ${config.account ? 'flex' : 'none'};justify-content: space-between;" id="nano-pay-contact"> 
		<div id="nano-pay-contact-label">${strings.account}</div> 
		<div id="nano-pay-line-items">${ config.account && config.account.includes('nano_') ? ( config.account.slice(0, 12) + '...' + config.account.slice(58, 999) ) : config.account }</div> 
	</div>

	<div style="display: ${(rpc_checkout.plans || get_name) && rpc_checkout.amount ? 'flex' : 'none'};justify-content: space-between;" id="nano-pay-contact"> 
		<div id="nano-pay-contact-label">${strings.quantity}</div> 
		<div id="nano-pay-line-items" style="line-height: 1.3;}">
			<select id="nano-pay-select-one" value="1, ${symbol}" onchange="window.NanoPay.onchange_select_one(this)">
				${ rpc_checkout.plans ? rpc_checkout.plans.map((a, i) => '<option '+ (i === 1 ? 'selected' : '') +' value="'+i+', '+symbol+'">'+a.title+'</option>').join('') : '' }
			</select>
		</div> 
	</div>

	<div style="display: ${window.NanoPay.config.require_alias ? 'flex' : 'none'};justify-content: space-between;" id="nano-pay-contact"> 
		<div id="nano-pay-contact-label">${strings.alias}<sup style="color: #ff5f5f; opacity: 1">*</sup></div> 
		<div id="nano-pay-line-items" style="line-height: 1.3;}">
			<input id="nano-pay-custom-input-one" oninput="window.NanoPay.onchange_custom_input_one(this)" type="text" placeholder="Custom Alias">
		</div> 
	</div>

	<div style="display: ${config.line_items ? 'flex' : 'none'}" id="nano-pay-contact"> 
		<div id="nano-pay-contact-label">${strings.line_items}</div> 
		<div id="nano-pay-line-items" style="line-height: 1.3;}">${config.line_items ? config.line_items.map(a => a.title || a.name).join(', ') : ''}</div> 
	</div>

	<div style="display: ${config.contact ? 'flex' : 'none'}" onclick="window.NanoPay.configEmailAddress()" id="nano-pay-contact"> 
		<div id="nano-pay-contact-label">${strings.email}</div> 
		<div id="nano-pay-user-contact-email" style="line-height: 1.1; opacity: ${window.NanoPay.config.contact_email ? '1' : '0.5'}">${window.NanoPay.config.contact_email || strings.email_placeholder}</div> 
		<svg id="Layer_1" version="1.1" viewBox="0 0 512 512" width="512px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon points="160,115.4 180.7,96 352,256 180.7,416 160,396.7 310.5,256 "></polygon></svg> 
	</div>
	
	<div style="display: ${Number(config.shipping) || config.shipping === true || config.shipping === "true" ? 'flex' : 'none'}" onclick="window.NanoPay.configMailingAddress()" id="nano-pay-shipping"> 
		<div id="nano-pay-shipping-label">${strings.shipping}</div> 
		<div id="nano-pay-user-mailing-address" style="line-height: 1.1; opacity: ${window.NanoPay.config.mailing_address ? '1' : '0.5'}">${window.NanoPay.config.mailing_address || strings.shipping_placeholder}</div> 
		<svg id="Layer_1" version="1.1" viewBox="0 0 512 512" width="512px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><polygon points="160,115.4 180.7,96 352,256 180.7,416 160,396.7 310.5,256 "></polygon></svg> 
	</div>
	
	<div id="nano-pay-details" style="${ config.amount || config.line_items || get_name || get_alias ? '' : 'display: none' }"> 
		<div style="display: ${Number(config.shipping) || config.shipping === true || config.shipping === "true" ? 'block' : 'none'}" id="nano-pay-details-spacer"></div>
		<div id="nano-pay-details-labels">
			<div style="display: ${config.shipping !== true && Number(config.shipping) ? 'block' : 'none'}">${strings.subtotal}</div>  
			<div style="display: ${config.shipping !== true && Number(config.shipping) ? 'block' : 'none'}">${strings.shipping}</div>  
			<br style="display: ${config.shipping !== true && Number(config.shipping) ? 'block' : 'none'}">
			<div id="nano-pay-description">${description}</div>  
		</div>  
		<div id="nano-pay-details-values">
			<div style="display: ${config.shipping !== true && Number(config.shipping) ? 'block' : 'none'}; text-align: right">${rpc_checkout.subtotal} ${symbol}</div>   
			<div style="display: ${config.shipping !== true && Number(config.shipping) ? 'block' : 'none'}; text-align: right">${rpc_checkout.shipping} ${symbol}</div>   
			<br style="display: ${config.shipping !== true && Number(config.shipping) ? 'block' : 'none'}; text-align: right"> 
			<div id="nano-pay-amount-value">${rpc_checkout.amount} ${symbol}</div>   
		</div> 
	</div>

	<div id="nano-pay-details" style="${ rpc_checkout.service_fee || rpc_checkout.service_fee === 0 ? '' : 'display: none' }"> 
		<div style="display: ${Number(config.shipping) || config.shipping === true || config.shipping === "true" ? 'block' : 'none'}" id="nano-pay-details-spacer"></div>
		<div id="nano-pay-details-labels">
			<div style="display: ${rpc_checkout.subtotal ? 'block' : 'none'}">${strings.description || 'Amount'}</div>  
			<div>${strings.service_fee}</div>  
			<br>
			<div id="nano-pay-description">Total Amount</div>  
		</div>  
		<div id="nano-pay-details-values">
			<div style="display: ${rpc_checkout.subtotal ? 'block' : 'none'}; text-align: right">${rpc_checkout.subtotal} ${symbol}</div>   
			<div style="text-align: right">${rpc_checkout.service_fee} ${symbol}</div>   
			<br> 
			<div id="nano-pay-amount-value">${rpc_checkout.amount} ${symbol}</div>   
		</div> 
	</div>
	
	<div id="nano-pay-disclaimer" style="display: ${config.disclaimer ? 'flex' : 'none'}">
		<div>${config.disclaimer}</div>
	</div>

	<div id="nano-pay-qrcode" style="display: none;">
		<img id="nano-pay-qrcode-image"/>
		<div id="nano-pay-copy-address">
			<div class="nano-pay-copy-clipboard" onclick="window.NanoPay.CopyToClipboard('address', this)">
				<span>${rpc_checkout.address.slice(0, config.vanity || 10)}..</span>
				<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6 6V2c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h4zm2 0h4a2 2 0 0 1 2 2v4h4V2H8v4zM2 8v10h10V8H2z"/></svg>
			</div>
			<div style="${rpc_checkout.amount === undefined ? 'display: none' : ''}" class="nano-pay-copy-clipboard" onclick="window.NanoPay.CopyToClipboard('amount', this)">
				<span id="nano-pay-copy-clipboard-amount">${String(rpc_checkout.amount).length > 7 ? String(rpc_checkout.amount).slice(0, 7) + '..' : String(rpc_checkout.amount)} ${symbol}</span>
				<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6 6V2c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h4zm2 0h4a2 2 0 0 1 2 2v4h4V2H8v4zM2 8v10h10V8H2z"/></svg>
			</div>
		</div>
	</div>
	

    <a id="nano-pay-submit" onclick="window.NanoPay.submit()"> 
    	<img id="nano-pay-submit-image" src="${wallets[wallet].image}" style="max-width: 45px;"> 
    	<span id="nano-pay-submit-text">${button}</span> 
    </a>

</div>`

		show_loading(false)

		var NanoPayDiv = document.createElement('div');
		NanoPayDiv.id = 'nano-pay';
		NanoPayDiv.innerHTML = template;
		document.body.appendChild(NanoPayDiv);
	    
	    setTimeout(() => {
	    	document.body.style.overflow = 'hidden';
	    	if (position === 'top') document.getElementById('nano-pay-body').style.top = "0"; 
	    	if (position === 'top' || position === 'center') document.getElementById('nano-pay-body').style.bottom = "auto"; 
	    	if (position === 'bottom') document.getElementById('nano-pay-body').style.bottom = "0"; 
	    }, 50)

	    if (qrcode !== false) {
			if (window.innerWidth > desktop_width || qrcode) {
				var qr_interval = setInterval(async () => {
				    if (window.NanoPay.config.require_alias && !window.NanoPay.config.provided_alias) return
				    if (window.NanoPay.config.shipping && !window.NanoPay.config.mailing_address) return
				    if (window.NanoPay.config.contact && !window.NanoPay.config.contact_email) return
					document.getElementById('nano-pay-qrcode').style.display = "flex"
					document.getElementById('nano-pay-qrcode-image').src = rpc_checkout.qrcode
				    clearInterval(qr_interval)
				}, 100)
			}
	    }

	    var checks = 0
	    var checking = false
	    var viewing_page = true
	    var required_information = false

		if (document.visibilityState) {
		  document.addEventListener('visibilitychange', function() {
		    if (document.visibilityState === 'visible') {
		      viewing_page = true
		      if (window.check_interval) check_payment()
		    } else {
		      viewing_page = false
		    }
		  })
		}

		var delay = 5000

	    function do_success(block) {
	    	if (block && block.block) {
		    	var success_el = document.getElementById('nano-pay-submit-image') 
		    	var success_text = document.getElementById('nano-pay-submit-text')
		    	if (success_el) success_el.src = 'https://pay.nano.to/img/success.gif?v=3'
		    	if (success_text) success_text.innerText = 'Success'
	    		if (config.success) {
			    	setTimeout(async () => {
	    				payment_success = true
		    			if ( config.success.constructor.name === 'AsyncFunction' ) await config.success(block)
		    			if ( config.success.constructor.name !== 'AsyncFunction' ) config.success(block)
		    		}, 100)
	    		}
	    		setTimeout(() => window.NanoPay.close(), 2000)
	    		clearInterval(window.check_interval)
	    		return
	    	}
	    }

	    async function check_payment() {
	    	if (!rpc_checkout || !window.NanoPay.config || window.NanoPay.config.debug) return
		    if (window.NanoPay.config.require_alias && !window.NanoPay.config.provided_alias) return
		    if (window.NanoPay.config.shipping && !window.NanoPay.config.mailing_address) return
		    if (window.NanoPay.config.contact && !window.NanoPay.config.contact_email) return
	    	if (!viewing_page) return
	    	if (checking) return
	    	checking = true
	    	document.getElementById('nano-pay-submit-text').innerText = 'Waiting for payment..'
			var block = (await RPC.post(rpc_checkout.check, { 
	    		note: window.NanoPay.config.note || window.NanoPay.config.memo || window.NanoPay.config.title,
	    		source: window.location.origin,
	    		shipping: window.NanoPay.config.mailing_address,
	    		email: window.NanoPay.config.contact_email,
	    		alias: window.NanoPay.config.provided_alias,
	    	}))
	    	checking = false
	    	do_success(block)
		}

	    window.check_interval = setInterval(async () => {
	    	if (checks < 60) {
		    	await check_payment()
	    	} else {
	    		clearInterval(window.check_interval)
	    	}
	    }, delay)

	    if (expiration && Number(expiration)) {
	    	countdownTimer(Number(expiration), (minutes, seconds) => {
	    		window.NanoPay.update_description(`${description} (${minutes}:${Number(seconds) < 10 ? '0' + seconds : seconds})`)
	    	}, async () => {
				if ( window.NanoPay.config.expired && window.NanoPay.config.expired.constructor.name === 'AsyncFunction' ) await window.NanoPay.config.expired()
				if ( window.NanoPay.config.expired && window.NanoPay.config.expired.constructor.name !== 'AsyncFunction' ) window.NanoPay.config.expired()
				window.NanoPay.close()
	    	})
	    }

	    // needs more testing
	    // goal is to prevent un-intentional browser refresh from breaking checkout flow
	    // if (rpc_checkout && rpc_checkout.id) localStorage.setItem('NanoPayCheckoutId', rpc_checkout.id)

    }

    window.NanoPay.configMailingAddress = async () => {
    	var shipping = window.prompt('Shipping Address: ')
    	if (shipping) {
    		if (window.NanoPay.config.localstorage !== false) localStorage.setItem('nano-pay-mailing-address', shipping)
    		if (window.NanoPay.config && window.NanoPay.config.shippingChange) {
		        if ( window.NanoPay.config.shippingChange && window.NanoPay.config.shippingChange.constructor.name === 'AsyncFunction' ) {
		        	var async_return = await window.NanoPay.config.shippingChange(shipping)
		        	if (!async_return) return
		        	if (typeof async_return === 'string') address = async_return
		        }
				if ( window.NanoPay.config.shippingChange && window.NanoPay.config.shippingChange.constructor.name !== 'AsyncFunction' ) {
					var sync_return = window.NanoPay.config.shippingChange(shipping)
		        	if (!sync_return) return
		        	if (typeof sync_return === 'string') address = sync_return
				}
	        }
    		window.NanoPay.config.mailing_address = shipping
    		document.getElementById('nano-pay-user-mailing-address').innerText = shipping
    		document.getElementById('nano-pay-user-mailing-address').style.opacity = '1'
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
    		document.getElementById('nano-pay-user-contact-email').style.opacity = '1'
    	}
    }

    window.NanoPay.init = async (config) => {

    	config = config || {}
        
        var all = document.querySelectorAll(config.element || '[data-amount]');

        if (all.length) {
	
            window.NanoPay.el = {}

            var buttonCssContent = `.nano-pay-button { cursor: pointer;padding: 7px 25px;border-radius: 4px;margin: 15px 0 10px 0;display: flex;align-items: center;justify-content: center;background: #ffffff;font-family: Helvetica, 'Arial';letter-spacing: 1px;min-height: 48px; color: ${config.color || '#000'} } .nano-pay-button img { max-width: 24px;width: auto;min-width: auto;margin: 0 8px 0 0!important;float: none; }`

            addStyleIfNotExists(buttonCssContent);

	        for (var i=0, max=all.length; i < max; i++) {

	            var item = all[i]

				config = {
					title: item.getAttribute('data-title'),
					amount: item.getAttribute('data-amount'),
					address: item.getAttribute('data-address') || item.getAttribute('data-name'),
					shipping: item.getAttribute('data-shipping') || false,
					contact: item.getAttribute('data-email') || item.getAttribute('data-contact') || false,
					position: item.getAttribute('data-position') || false,
					button: item.getAttribute('data-button') || false,
					notify: item.getAttribute('data-notify') || false,
					random: item.getAttribute('data-random') || true,
					currency: item.getAttribute('data-currency') || false,
					debug: item.getAttribute('data-debug') || false,
					key: item.getAttribute('data-key') || item.getAttribute('data-public_key') || item.getAttribute('data-public-key') || false,
				}

				var original_text =  all[i].innerText

	            all[i].innerHTML = ''
	            
	            let code = `<div onclick="window.NanoPay.open('el-${i}')" class="nano-pay-button"><img src="https://pay.nano.to/img/xno.svg" alt="">${ original_text || strings.button }</div></div>`

	            item.innerHTML += code

				window.NanoPay.el[i] = config

	        }

        } else {
        	window.NanoPay.config = config
        }

    }

})();

if (document.querySelectorAll('[data-amount]').length) window.NanoPay.init()
