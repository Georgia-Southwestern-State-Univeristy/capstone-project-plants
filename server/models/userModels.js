// models/User.js
export default class User {
    constructor(uid, email, name, createdAt = new Date()) {
      this.uid = uid;
      this.email = email;
      this.name = name;
      this.createdAt = createdAt.toISOString();
    }
  
    toFirestore() {
      return {
        uid: this.uid,
        email: this.email,
        name: this.name,
        createdAt: this.createdAt,
      };
    }
  }
  