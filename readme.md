![line](https://github.com/fwd/n2/raw/master/.github/line.png)

<h1 align="center">NanoPay.js</h1>

<h3 align="center">Nano Payment Library</h3>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)
![line](https://pbs.twimg.com/media/F_4K6f6XoAAYtPE?format=jpg&name=medium)
![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Live Demo

<a target="_blank" href="https://blog.nano.to">https://pay.nano.to</a>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Install

**Local:**
```html
<script src="/latest.js"></script>
```

**CDN:**
```html
<script src="https://pay.nano.to/latest.js"></script>
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Paywall

Monetize any DOM element on your website.

> **This library is not for keeping secrets. It is to make it easier for users to support you. Anyone can bypass this kind of  paywall with some tinkering.**

```html
<script>
    nano.paywall({ 
        element: '.premium', // required, all with class .premium
        address: 'YOUR_ADDRESS', // required
        amount: 0.001, // required
        debug: false, // optional
        free: false, // // optional, allow free access
        background: '#000000de', // optional css hex
        text: 'Read Lorem for', // optional
        title: '', // optional
        color: '', // optional
        // endpoint: 'https://nanolooker.com/api/rpc', // optional
        success: (block) => {
            // Element(s) are automatically shown.
            console.log(block)
        }
    })
</script>
```

### Single Charge

Accept one-time Nano payments.

```html
<script>
    // open up popup
    nano.charge({ 
        address: 'YOUR_ADDRESS', // required
        amount: 0.001, // required
        random: true, // recommended
        success: (block) => {
            console.log(block)
        }
    })
</script>
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## Sponsor (DigitalOcean)

<a align="center" target="_blank" href="https://m.do.co/c/f139acf4ddcb"><img style="object-fit: contain;
    max-width: 100%;" src="https://github.com/fwd/fwd/raw/master/ads/digitalocean_new.png" width="970" /></a>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### License

**MIT**

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

### Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-pay.svg)](https://github.com/fwd/nano-pay)
