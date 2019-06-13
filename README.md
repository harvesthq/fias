## FIAS (Filler Impact Assessment Scale)

### How much of the App is affected?

- **1** Equivalent to a single partial
- **5** A small handful of views
- **10** It's everywhere, like the plague

### How much of this change is mysterious to you?

- **1** Nothing - it's straight forward
- **5** I understand what it's doing, but I'm not 100% sure about parts
- **10** It's freaking greek

### How easy is it for you to imagine this performs in an unexpected way after deployment?

- **1** Dude, it's a copy change
- **5** I could see some potential for problems, but they seem unlikely to have humongous impact
- **10** I can imagine about 400 ways this blows up

## Results

* **15 or greater** should require **two devs to +1 (and probably some click testing)**.
* **20 or greater** should trigger an **auto QA of all affected areas**.

## Deploying

To "deploy" it just push it to the master branch.

If you make any changes to the stylesheets or coffescript, update the "version" to invalidate
people's browser cache https://github.com/harvesthq/fias/commit/3af36ea7ccdae27e7efbfab9a11b85a57e62f173
