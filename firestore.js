"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

/* DB Connection */

const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.cert(require(process.env.GOOGLE_JSON))
});

let db = admin.firestore();

/* ! DB Connection */

class FireStorage {
    async _getItem(key) {
      return new Promise((resolve, reject) => {
        let ref = db.collection(this.collection).doc(key);
        let item = ref.get()
         .then(doc => {
           if (!doc.exists) {
             resolve({});
           } else {
             resolve(doc.data());
           }
         })
         .catch(err => {
           reject(err);
         });
      });
    };
    async _setItem(key, value)
    {
      return new Promise((resolve, reject) => {
        db.collection(this.collection).doc(key).set(value).then(resolve).catch(reject);
      });
    };
    async _deleteItem(key)
    {
      return new Promise((resolve, reject) => {
        db.collection(this.collection).doc(key).delete().then(resolve).catch(reject);
      });
    };
    constructor(collection = 'chatbot') {
          this.collection = collection;
		      this.cache = {};
    };
    read(keys) {
      return new Promise(async (resolve, reject) => {
        try
        {
          const data = {};

          for(var i = 0; i < keys.length; i++)
          {
            if(this.cache[keys[i]] !== undefined)
              data[keys[i]] = this.cache[keys[i]];
            else
              data[keys[i]] = await this._getItem(keys[i]);
          }

          resolve(data);
        }
  		  catch(e)
        {
          reject(e);
        }
      });
    };
    write(changes) {
      return new Promise(async (resolve, reject) => {
          try
          {
            for (const key in changes) {
              this.cache[key] = changes[key];
              await this._setItem(key, changes[key]);
            }
            resolve();
          }
          catch(e)
          {
            reject(e);
          }
        });
    };
    delete(keys) {
      return new Promise(async (resolve, reject) => {
        try {
          for(var i = 0; i< keys.length;i++) {
              delete this.cache[keys[i]];
              await this.deleteItem(keys[i]);
            }
          resolve();
        }
        catch(e)
        {
          reject(e);
        }
    });
  };
}
exports.FireStorage = FireStorage;
