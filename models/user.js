const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    cart: {
        items: [{
            productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, require: true }
        }]
    }
})

userSchema.methods.addToCart = function(product) {
    const cartProductIndex = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString()
    })

    let newQuantity = 1
    const updatedCartItems = [...this.cart.items]

    if (cartProductIndex >= 0) {
        newQuantity = this.cart.items[cartProductIndex].quantity + 1
        updatedCartItems[cartProductIndex].quantity = newQuantity
    } else {
        updatedCartItems.push({
            productId: product._id,
            quantity: newQuantity
        })
    }
    const updatedCart = { items: updatedCartItems }
    this.cart = updatedCart
    return this.save()
}

userSchema.methods.removeFromCart = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString())
    this.cart.items = updatedCartItems
    return this.save()
}

module.exports = mongoose.model('User', userSchema)

// const mongodb = require('mongodb')
//     // const getDb = require('../util/database').getDb

// class User {
//     constructor(username, email, cart, id) {
//         this.username = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = id;
//     }

//     save() {
//         const db = getDb()
//         return db
//             .collection('users')
//             .insertOne(this)
//     }

//     addToCart(product) {
//         const cartProductIndex = this.cart.items.findIndex(cp => {
//             return cp.productId.toString() === product._id.toString()
//         })

//         let newQuantity = 1
//         const updatedCartItems = [...this.cart.items]

//         if (cartProductIndex >= 0) {
//             newQuantity = this.cart.items[cartProductIndex].quantity + 1
//             updatedCartItems[cartProductIndex].quantity = newQuantity
//         } else {
//             updatedCartItems.push({ productId: new mongodb.ObjectId(product._id), quantity: newQuantity })
//         }
//         const updatedCart = { items: updatedCartItems }
//         const db = getDb()
//         return db
//             .collection('users')
//             .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: updatedCart } })
//     }

//     getCart() {
//         const db = getDb()
//         const productIds = this.cart.items.map(item => item.productId)
//         return db
//             .collection('products')
//             .find({ _id: { $in: productIds } })
//             .toArray()
//             .then(product => {
//                 return product.map(p => {
//                     return {...p,
//                         quantity: this.cart.items.find(i => {
//                             return i.productId.toString() === p._id.toString()
//                         }).quantity
//                     }
//                 })
//             })
//             .catch(err => console.log(err))
//     }

//     deleteItemFromCart(productId) {
//         const updatedCartItems = this.cart.items.filter(item => item.productId.toString() !== productId.toString())
//         const db = getDb()
//         return db
//             .collection('users')
//             .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: updatedCartItems } } })
//     }

//     addOrder() {
//         const db = getDb()
//         return this.getCart().then(products => {
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new mongodb.ObjectId(this._id),
//                     username: this.username
//                 }
//             }
//             return db
//                 .collection('orders')
//                 .insertOne(order)
//         }).then(result => {
//             this.cart = { items: [] }
//             return db
//                 .collection('users')
//                 .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: { cart: { items: [] } } })
//         })
//     }

//     getOrders() {
//         const db = getDb()
//         return db
//             .collection('orders')
//             .find({ 'user._id': new mongodb.ObjectId(this._id) })
//             .toArray()
//     }

//     static findById(userId) {
//         const db = getDb()
//         return db
//             .collection('users')
//             .findOne({ _id: new mongodb.ObjectId(userId) })
//             .then(user => {
//                 console.log(user)
//                 return user
//             })
//             .catch(err => console.log(err))
//     }
// }

// module.exports = User;