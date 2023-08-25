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
const { encrypt, decrypt } = require('@ideadesignmedia/helpers')
const encryptWallet = (wallet) => {
    return encrypt(JSON.stringify(wallet), process.env.ENCRYPTION_KEY)
}
const decryptWallet = (wallet) => {
    return JSON.parse(decrypt(wallet, process.env.ENCRYPTION_KEY))
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
app.post('/wallet', (req, res) => {
    const { privateKey } = req.body
    if (!privateKey) return res.status(400).json({ error: 'privateKey is required' })
    const wallet = !privateKey ? null : / /.test(privateKey) ? new ethers.Wallet.fromMnemonic(privateKey) : new ethers.Wallet(privateKey)
    new Wallet().find({ privateKey }).then(exists => {
        if (exists) return res.status(200).json({ error: false, address: exists.address })
        new Wallet({ address: wallet.address, privateKey }).save().then(wallet => {
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