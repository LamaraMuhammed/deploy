class DB {
  constructor() {
    this.db = null;
    this.initDB();
  }

  initDB() {
    try {
      const request = indexedDB.open("index_g", 1);
  
      request.onsuccess = (event) => {
        this.db = event.target.result;
      };
  
      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        this.db.createObjectStore("custom_icon", { keyPath: "id" });
        this.db.createObjectStore("prof_img", { keyPath: "id" });
        this.db
          .createObjectStore("chats", { keyPath: "id" })
          // Optional: create indexes if needed
          .createIndex("idx", "idx", { unique: false });
      };
    } catch (error) {
      return null;
    }
  }

  storeChat(from, to, remoteName, message, time) {
    if (!this.db) {
      return;
    }

    try {
      const idx = [from, to].sort().join("|"); // consistent identifier

      const newMessage = {
        id: Date.now(),
        idx,
        from,
        to,
        remoteName,
        message,
        time,
      };

      const tx = this.db.transaction("chats", "readwrite");
      const store = tx.objectStore("chats");

      store.add(newMessage);

    } catch (error) {
      return null;
    }
  }

  getChatHistory(user1, user2, callback) {
    if (!this.db) {
      return;
    }

    try {
      const idx = [user1, user2].sort().join("|");

      const tx = this.db.transaction("chats", "readonly");
      const store = tx.objectStore("chats");
      const index = store.index("idx");

      const result = index.getAll(IDBKeyRange.only(idx));

      result.onsuccess = function () {
        // sort by timestamp before passing
        const sortedMessages = result.result.sort((a, b) => a.time - b.time);
        callback(sortedMessages);
      };

    } catch (error) {
      return null;  
    }
  }

  update(newMessage) {
    if (!this.db) {
      return;
    }

    try {
      const tx = this.db.transaction("custom_icon", "readwrite");
      const store = tx.objectStore("custom_icon");
      const updateMsg = function (n, old) {
        return { ...old, message: n.message, image: n.image };
      };
  
      const getRequest = store.get("custom_icon");
  
      getRequest.onsuccess = function () {
        let record = getRequest.result;
  
        if (record) {
          // Modify the record
          record = updateMsg(newMessage, record);
          store.put(record);
        }
      };
    } catch (error) {
      return null;
    }
  }

  clearAllChats() {
    if (!this.db) {
      console.error("DB not initialized.");
      return;
    }

    const tx = this.db.transaction("chats", "readwrite");
    const store = tx.objectStore("chats");

    const request = store.clear();

    request.onsuccess = () => {
      console.log("All chats cleared.");
    };

    request.onerror = (event) => {
      console.error("Error clearing chats:", event.target.error);
    };
  }

  // CUSTOM ICON IMAGE AND TEXT
  storeThis(text, imgBlob) {
    if (!this.db) {
      return;
    }

    try {
      const tx = this.db.transaction("custom_icon", "readwrite");
      const st = tx.objectStore("custom_icon");

      const iconEntry = {
        id: "custom_icon",
        message: text || null,
        image: imgBlob || null,
      };

      st.add(iconEntry);

    } catch (error) {
      return null;
    }
  }

  getThisData(callback) {
    if (!this.db) {
      return;
    }

    try {
      const tx = this.db.transaction("custom_icon", "readonly");
      const st = tx.objectStore("custom_icon");

      const request = st.get("custom_icon");

      request.onsuccess = () => {
        if (callback) callback(request.result);
      };
    } catch (error) {
      return null;
    }
  }

  deletePrev() {
    if (!this.db) {
      return;
    }

    try {
      const tx = this.db.transaction("custom_icon", "readwrite");
      const st = tx.objectStore("custom_icon");
  
      st.clear();

    } catch (error) {
      return null;
    }
  }
}

export const db = new DB();