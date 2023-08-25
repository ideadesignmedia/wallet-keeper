require("@ideadesignmedia/config.js")
const ethers = require('ethers')
const { db: DB, makeModels } = require('@ideadesignmedia/db.js')
const db = new DB('wallets', true)
const { Wallet } = makeModels(db, [
    {
        name: 'Wallet',
        schema: {
            address: 'string',
            privateKey: 'string'
        }
    }
])
const { encrypt, decrypt } = require('@ideadesignmedia/encryption')
const encryptWallet = (wallet) => {
    return encrypt(JSON.stringify(wallet), process.env.ENCRYPTION_KEY, process.env.ENCRYPTION_IV)
}
const decryptWallet = (wallet) => {
    return decrypt(wallet, process.env.ENCRYPTION_KEY, process.env.ENCRYPTION_IV)
}
const app = require("express").Router()
const isAddress = (address) => {
    if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) return false
    try {
        return ethers.utils.getAddress(address)
    } catch {
        return false
    }
}
app.get('/wallet/:address', (req, res) => {
    const { address } = req.params
    const validAddress = isAddress(address)
    if (!validAddress) return res.status(400).json({ error: 'invalid address' })
    new Wallet().find({ address: validAddress }).then(wallet => {
        if (wallet) {
            res.status(200)
            res.setHeader('Content-Type', 'text/plain')
            res.end(encryptWallet({ privateKey: wallet.privateKey }))
        } else {
            res.status(404).json({ error: 'wallet not found' })
        }
    }).catch(e => {
        res.status(500).json({ error: 'internal server error' })
    })
})
const testPrivateKey = privateKey => {
    try {
        if (!/ /.test(privateKey) && !/^(0x)?[0-9a-f]{64}$/i.test(privateKey)) {
            const key = decryptWallet(privateKey)
            const wallet =  / /.test(key) ? new ethers.Wallet.fromMnemonic(key) : new ethers.Wallet(key)
            if (!isAddress(wallet.address)) return false
            return key
        }
        return privateKey
    } catch {
        return false
    }
}
app.post('/wallet', (req, res) => {
    const { privateKey: userProvided } = req.body
    if (!userProvided) return res.status(400).json({ error: 'privateKey is required' })
    const privateKey = testPrivateKey(userProvided)
    if (!privateKey) return res.status(400).json({ error: 'invalid privateKey' })
    const wallet = !privateKey ? null : / /.test(privateKey) ? new ethers.Wallet.fromMnemonic(privateKey) : new ethers.Wallet(privateKey)
    new Wallet().find({ privateKey }).then(exists => {
        if (exists) return res.status(200).json({ error: false, address: exists.address })
        new Wallet({ address: ethers.utils.getAddress(wallet.address), privateKey }).save().then(wallet => {
            res.status(200).json({ address: wallet.address })
        }).catch(e => {
            console.log(e)
            res.status(500).json({ error: 'internal server error' })
        })
    }).catch(e => {
        console.log(e)
        res.status(500).json({ error: 'internal server error' })
    })
})

require('@ideadesignmedia/webserver.js')({ port: process.env.PORT || 5000 }, app)