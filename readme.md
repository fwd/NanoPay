![line](https://raw.githubusercontent.com/nano-to/nano-node-cli/main/.github/line.png)

<h1 align="center">NanoPay.js 2.0.0</h1>

<h3 align="center">The Ultimate Nano Currency Payment Library</h3>

<p align="center">
  <strong>Accept Nano payments with just a few lines of code!</strong><br>
  Beautiful, customizable payment modals with glass morphism effects, dark mode support, premium content walls, and enterprise-grade security.
</p>

<div align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue.svg" alt="Version 2.0.0">
  <img src="https://img.shields.io/badge/Security-Enhanced-green.svg" alt="Enhanced Security">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="MIT License">
</div>

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## ✨ Features

- 🎨 **Beautiful UI** - Modern glass morphism design with backdrop blur effects
- 🌙 **Dark Mode** - Automatic dark/light theme detection
- 📱 **Mobile First** - Responsive design that works on all devices
- 🔒 **Premium Content Walls** - Lock content behind payments
- 📧 **Email Collection** - Built-in email input screens with validation
- 🚚 **Shipping Forms** - Complete shipping address collection
- 💳 **Multiple Wallets** - Support for Natrium, Nault, Nautilus, and more
- 🎯 **Easy Integration** - Works with any website or app
- ⚡ **Lightweight** - Only ~50KB, no dependencies
- 🔧 **Highly Customizable** - Custom CSS themes, colors, and styling
- 🛡️ **Enterprise Security** - XSS protection, input validation, secure storage
- ✅ **Input Validation** - Comprehensive validation for amounts, addresses, emails
- 🔐 **Secure Storage** - Safe localStorage handling with sanitization

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## 🚀 Quick Start

### 1. Include the Script

```html
<script src="https://cdn.nano.to/pay.js"></script>
```

**With Integrity Hash (Recommended for Production):**

```html
<script src="https://cdn.nano.to/pay.js" integrity="sha512-jDkcxSRPptrRBo77/iW1LrA1TytAGwJRIL1Q0e7bKE0fkYaYPI8pT0o6yF5bsk1oH3aHtzLyKpihQkeU+AaOxw==" crossorigin="anonymous"></script>
```

### 2. Add a Payment Button

```html
<!-- Simple payment button -->
<div data-amount="1" 
     data-address="nano_1demo1234567890abcdefghijklmnopqrstuvwxyz" 
     data-title="Buy Coffee">
    Pay 1 NANO
</div>
```

### 3. That's It! 🎉

The button automatically becomes a beautiful payment modal when clicked!

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## 📖 Basic Examples

### Simple Payment Button

```html
<div data-amount="5" 
     data-address="nano_1yourwalletaddresshere" 
     data-title="Buy Premium Access">
    Get Premium Access - 5 NANO
</div>
```

### Payment with Description

```html
<div data-amount="2.5" 
     data-address="nano_1yourwalletaddresshere" 
     data-title="Digital Download"
     data-description="Download our latest ebook">
    Download Ebook - 2.5 NANO
</div>
```

### Payment Requiring Email

```html
<div data-amount="10" 
     data-address="nano_1yourwalletaddresshere" 
     data-title="Newsletter Subscription"
     data-contact="true">
    Subscribe to Newsletter - 10 NANO
</div>
```

### Payment with Shipping

```html
<div data-amount="25" 
     data-address="nano_1yourwalletaddresshere" 
     data-title="Physical Product"
     data-shipping="true">
    Buy Physical Product - 25 NANO
</div>
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## 🎨 Customization Examples

### Custom Colors and Styling

```html
<div data-amount="1" 
     data-address="nano_1yourwalletaddresshere" 
     data-title="Custom Styled Payment"
     data-background="#2c3e50"
     data-text="#ecf0f1"
     data-button="Custom Pay Button">
    Custom Styled Payment
</div>
```

### Different Modal Positions

```html
<!-- Bottom position (default) -->
<div data-amount="1" data-address="nano_1yourwalletaddresshere" data-position="bottom">
    Bottom Payment
</div>

<!-- Top position -->
<div data-amount="1" data-address="nano_1yourwalletaddresshere" data-position="top">
    Top Payment
</div>

<!-- Center position -->
<div data-amount="1" data-address="nano_1yourwalletaddresshere" data-position="center">
    Center Payment
</div>
```

### Custom Wallet Preference

```html
<div data-amount="1" 
     data-address="nano_1yourwalletaddresshere" 
     data-wallet="natrium">
    Pay with Natrium
</div>
```

### Payment with Line Items (Shopping Cart)

```html
<div data-amount="15" 
     data-address="nano_1yourwalletaddresshere" 
     data-title="Shopping Cart"
     data-line-items='[{"name":"T-Shirt","price":10},{"name":"Mug","price":5}]'>
    Complete Purchase - 15 NANO
</div>
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## 🔧 Programmatic Usage

### Basic Programmatic Payment

```javascript
// Open payment modal programmatically
window.NanoPay.open({
    title: 'Custom Payment',
    amount: 5,
    address: 'nano_1yourwalletaddresshere',
    description: 'This is a programmatic payment',
    success: function(block) {
        console.log('Payment successful!', block);
        alert('Payment completed!');
    },
    cancel: function() {
        console.log('Payment cancelled');
    }
});
```

### Payment with Callbacks

```javascript
window.NanoPay.open({
    title: 'Payment with Callbacks',
    amount: 10,
    address: 'nano_1yourwalletaddresshere',
    success: function(block) {
        // Handle successful payment
        console.log('Payment block:', block.block);
        // Redirect user or show success message
        window.location.href = '/success';
    },
    cancel: function() {
        // Handle cancelled payment
        console.log('User cancelled payment');
    },
    expired: function() {
        // Handle expired payment
        console.log('Payment expired');
    }
});
```

### Premium Content Wall

```javascript
// Lock content behind a payment
window.NanoPay.wall({
    element: '#premium-content',
    title: 'Unlock Premium Content',
    amount: 5,
    address: 'nano_1yourwalletaddresshere',
    description: 'Pay to unlock this premium content',
    button: 'Unlock with Nano',
    success: function(block, element, elementId) {
        console.log('Content unlocked!', block);
        // Content is automatically unlocked
    }
});
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## 🎨 Custom CSS Themes

### Dark Theme

```css
<style>
/* Enable dark mode */
window.NanoPay.dark_mode = true;
</style>
```

### Custom Glass Morphism Theme

```css
<style>
/* Override NanoPay styles with custom theme */
#nano-pay-body {
    background: rgba(255, 255, 255, 0.1) !important;
    backdrop-filter: blur(30px) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37) !important;
}

#nano-pay-backdrop {
    backdrop-filter: blur(15px) !important;
    background: rgba(0, 0, 0, 0.3) !important;
}
</style>
```

### Neon Theme

```css
<style>
#nano-pay-body {
    background: rgba(0, 0, 0, 0.8) !important;
    border: 2px solid #00ffff !important;
    box-shadow: 0 0 20px #00ffff !important;
}

#nano-pay-submit {
    background: linear-gradient(45deg, #00ffff, #ff00ff) !important;
    box-shadow: 0 0 15px rgba(0, 255, 255, 0.5) !important;
}

#nano-pay-header span {
    color: #00ffff !important;
    text-shadow: 0 0 10px #00ffff !important;
}
</style>
```

### Minimal Theme

```css
<style>
#nano-pay-body {
    background: rgba(255, 255, 255, 0.95) !important;
    border: none !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
    border-radius: 12px !important;
}

#nano-pay-submit {
    background: #000 !important;
    color: #fff !important;
    border-radius: 8px !important;
    font-weight: 500 !important;
}

#nano-pay-header-container {
    border-bottom: 1px solid #f0f0f0 !important;
}
</style>
```

### Gradient Theme

```css
<style>
#nano-pay-body {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    color: white !important;
    border: none !important;
}

#nano-pay-submit {
    background: rgba(255, 255, 255, 0.2) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    color: white !important;
}

#nano-pay-header span {
    color: white !important;
}
</style>
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## 🌟 Real-World Use Cases

### E-commerce Store

```html
<!-- Product page -->
<div class="product-card">
    <h3>Premium T-Shirt</h3>
    <p>High-quality cotton t-shirt with custom design</p>
    <div data-amount="25" 
         data-address="nano_1yourwalletaddresshere" 
         data-title="Premium T-Shirt"
         data-shipping="true"
         data-contact="true"
         data-description="Premium cotton t-shirt with custom design">
        Buy Now - 25 NANO
    </div>
</div>
```

### Digital Downloads

```html
<!-- Download page -->
<div class="download-section">
    <h3>Premium Software License</h3>
    <p>Unlock all features with a one-time payment</p>
    <div data-amount="50" 
         data-address="nano_1yourwalletaddresshere" 
         data-title="Software License"
         data-contact="true"
         data-description="Premium software license with lifetime updates">
        Purchase License - 50 NANO
    </div>
</div>
```

### Subscription Service

```html
<!-- Subscription page -->
<div class="subscription-card">
    <h3>Monthly Premium Access</h3>
    <ul>
        <li>Unlimited downloads</li>
        <li>Priority support</li>
        <li>Exclusive content</li>
    </ul>
    <div data-amount="10" 
         data-address="nano_1yourwalletaddresshere" 
         data-title="Monthly Subscription"
         data-contact="true"
         data-description="Monthly premium access to all features">
        Subscribe - 10 NANO/month
    </div>
</div>
```

### Donation Button

```html
<!-- Donation section -->
<div class="donation-section">
    <h3>Support Our Project</h3>
    <p>Help us continue developing amazing features</p>
    <div data-amount="5" 
         data-address="nano_1yourwalletaddresshere" 
         data-title="Support Development"
         data-description="Thank you for supporting our project!">
        Donate 5 NANO
    </div>
</div>
```

### Premium Content Wall

```html
<!-- Content that requires payment -->
<div id="premium-article" class="article">
    <h2>Premium Article Title</h2>
    <p>This is a preview of the premium content...</p>
    <div class="premium-content">
        <h3>This content is locked!</h3>
        <p>Pay to unlock the full article</p>
        <div data-amount="2" 
             data-address="nano_1yourwalletaddresshere" 
             data-title="Unlock Premium Article"
             data-description="Access to the full premium article">
            Unlock Article - 2 NANO
        </div>
    </div>
</div>

<script>
// Lock the premium content
window.NanoPay.wall({
    element: '#premium-article',
    title: 'Unlock Premium Article',
    amount: 2,
    address: 'nano_1yourwalletaddresshere',
    description: 'Access to the full premium article',
    button: 'Unlock Article'
});
</script>
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## 🔧 Advanced Configuration

### Custom Configuration Object

```javascript
// Initialize with custom configuration
window.NanoPay.init({
    // Default wallet preference
    wallet: 'natrium',
    
    // Default position
    position: 'bottom',
    
    // Custom styling
    background: '#2c3e50',
    text: '#ecf0f1',
    
    // Enable dark mode
    dark_mode: true,
    
    // Custom callbacks
    onSuccess: function(block) {
        console.log('Payment successful:', block);
        // Custom success handling
    },
    
    onCancel: function() {
        console.log('Payment cancelled');
        // Custom cancel handling
    },
    
    onEmailUpdate: function(email) {
        console.log('Email updated:', email);
        // Custom email handling
    },
    
    onShippingUpdate: function(address) {
        console.log('Shipping updated:', address);
        // Custom shipping handling
    }
});
```

### Payment with Expiration

```javascript
window.NanoPay.open({
    title: 'Limited Time Offer',
    amount: 20,
    address: 'nano_1yourwalletaddresshere',
    expiration: 300, // 5 minutes
    success: function(block) {
        console.log('Payment completed in time!');
    },
    expired: function() {
        console.log('Payment expired');
        alert('Payment expired. Please try again.');
    }
});
```

### Payment with Custom Disclaimer

```javascript
window.NanoPay.open({
    title: 'Service Purchase',
    amount: 100,
    address: 'nano_1yourwalletaddresshere',
    disclaimer: 'This is a non-refundable purchase. By proceeding, you agree to our terms of service.',
    success: function(block) {
        console.log('Service purchased successfully!');
    }
});
```

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## 🛡️ Security Features

### Enterprise-Grade Security

NanoPay 2.0.0 includes comprehensive security features to protect your users and your application:

#### **XSS Protection**
- All user content is sanitized before rendering
- HTML entities are properly escaped
- Template injection attacks are prevented

#### **Input Validation**
- **Amount Validation**: Ensures amounts are positive and within reasonable limits (max 1M NANO)
- **Address Validation**: Validates Nano address format (with demo address support)
- **Email Validation**: Comprehensive email format validation
- **Content Sanitization**: All user inputs are sanitized

#### **Secure Storage**
- Safe localStorage wrapper with error handling
- Keys and values are sanitized before storage
- Graceful failure handling for storage issues

#### **API Security**
- URL validation for all API calls
- Response validation and error handling
- Network error protection

### Content Security Policy (CSP)

Add this to your HTML `<head>` for maximum security:

```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.nano.to;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://cdn.nano.to https://wall.nano.to;
    connect-src 'self' https://api.nano.to https://rpc.nano.to;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
">
```

### Security Best Practices

1. **Always validate user inputs** before passing to NanoPay
2. **Use HTTPS** for all API endpoints
3. **Implement server-side validation** for payment verification
4. **Monitor for suspicious activity** (unusual payment patterns)
5. **Keep NanoPay updated** to the latest version

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## 🛠️ Troubleshooting & FAQ

### Common Issues

**Q: Payment button not showing?**
A: Make sure you've included the script and added the required data attributes (`data-amount` and `data-address`).

**Q: Modal not opening on mobile?**
A: Ensure your viewport meta tag is set: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

**Q: Dark mode not working?**
A: Set `window.NanoPay.dark_mode = true` before initializing payments.

**Q: Custom CSS not applying?**
A: Use `!important` in your CSS rules or load your styles after the NanoPay script.

**Q: Demo addresses not working?**
A: Demo addresses starting with `nano_1demo` are automatically allowed for testing purposes.

**Q: Security validation too strict?**
A: The validation is designed to protect users. For demos, use addresses starting with `nano_1demo`.

**Q: Glass morphism effects not showing?**
A: Ensure your browser supports `backdrop-filter`. Use a modern browser like Chrome 76+, Firefox 103+, or Safari 9+.

### Debug Mode

Enable debug mode to see detailed logs:

```javascript
window.NanoPay.open({
    title: 'Debug Payment',
    amount: 1,
    address: 'nano_1yourwalletaddresshere',
    debug: true, // Enable debug mode
    success: function(block) {
        console.log('Debug info:', block);
    }
});
```

### Security Testing

Test the security features:

```javascript
// Test input validation
window.NanoPay.open({
    title: 'Security Test',
    amount: -1, // This will be rejected
    address: 'invalid_address', // This will be rejected
    description: 'Testing security features'
});
```

### Browser Compatibility

NanoPay.js works on all modern browsers:
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## 📚 Documentation

For complete API documentation and advanced features:

**[📖 Full Documentation](https://docs.nano.to/nanopay)**

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## 🎯 Live Demo

See NanoPay in action:

**[🚀 Live Demo on CodePen](https://codepen.io/nano2dev/pen/VwRQypE)**

![line](https://github.com/fwd/n2/raw/master/.github/line.png)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

Copyright 2025 @Nano2Dev

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

![line](https://raw.githubusercontent.com/nano-to/nano-node-cli/main/.github/line.png)

## ⭐ Stargazers

[![Stargazers over time](https://starchart.cc/fwd/nano-pay.svg)](https://github.com/fwd/nano-pay)

![line](https://raw.githubusercontent.com/nano-to/nano-node-cli/main/.github/line.png)

## 🏆 Sponsor (DigitalOcean)

<a align="center" target="_blank" href="https://m.do.co/c/f139acf4ddcb"><img style="object-fit: contain; max-width: 100%;" src="https://github.com/fwd/fwd/raw/master/ads/digitalocean_new.png" width="970" /></a>

![line](https://raw.githubusercontent.com/nano-to/nano-node-cli/main/.github/line.png)