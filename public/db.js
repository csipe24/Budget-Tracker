let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore("transactions", { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(event) {
  console.log("Error: " + event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(["transactions"], "readwrite");

  const transactionStore = transaction.objectStore("transactions");

  transactionStore.add(record);
}

function checkDatabase() {

  const transaction = db.transaction(["transaction"], "readwrite");
  const transactionStore = transaction.objectStore("transaction");
  const getAll = transactionStore.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        const transaction = db.transaction(["pending"], "readwrite");

        const store = transaction.objectStore("pending");

        store.clear();
      });
    }
  };
}

window.addEventListener("online", checkDatabase);