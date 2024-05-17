// Creating an Ethereum wallet on their blockchain is too complicated for me right now and need more time.

// The Document Object Model is a way for programs to interact with web documents.
// It provides a structured representation of the HTML document, allowing to manipulate the structure, style, and content.

// addEventListener sets up a function to run when a specific event happens.
document.addEventListener('DOMContentLoaded', () => {
  renderInitialOptions();
});

// Render functions insert dynamically created HTML content into a designated element on the webpage, showing it to the user.
function renderInitialOptions() {
  // The getElementById method retrieves an element from the document by its unique ID, allowing access to manipulate or retrieve information about that element.
  const app = document.getElementById('app');
  // innerHTML sets the HTML content inside an element
  app.innerHTML = `
    <h1>Your Ethereum Wallet</h1>
    <button onclick="renderPasswordSetup()">Create New Wallet</button>
    <button onclick="renderLogin()">Log Into Wallet</button>
  `;
}

// Render the login form interface
function renderLogin() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Login to Your Wallet</h1>
    <input type="password" id="password" placeholder="Enter your password" />
    <button onclick="login()">Login</button>
    <div id="passwordFeedback"></div>
  `;
}

// Process login form submissions
function login() {
  const inputPassword = document.getElementById('password').value;
  const wallets = JSON.parse(localStorage.getItem('wallets') || '[]');
  const wallet = wallets.find(wallet => wallet.password === inputPassword);

  if (wallet) {
    renderWalletInterface(wallet);
  } else {
    document.getElementById('passwordFeedback').textContent = "Incorrect password. Please try again.";
  }
}

// Render the interface for setting up a new wallet
function renderPasswordSetup() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Create New Wallet</h1>
    <input type="password" id="newPassword" placeholder="Set a strong password" />
    <button onclick="setPassword()">Set Password and Create Wallet</button>
    <div id="passwordFeedback"></div>
  `;
}

// Set up a new wallet with a unique password
function setPassword() {
  const password = document.getElementById('newPassword').value;
  const wallets = JSON.parse(localStorage.getItem('wallets') || '[]');
  if (wallets.some(wallet => wallet.password === password)) {
    document.getElementById('passwordFeedback').textContent = "This password is already in use.";
    return;
  }

  alert("Make sure you saved your password and stored it in a safe place.");
  const newWallet = {
    password,
    address: generateAddress(),
    balance: 0
  };
  wallets.push(newWallet);
  // Local storage is a browser feature for storing data persistently on the user's device, even after the browser is closed.
  localStorage.setItem('wallets', JSON.stringify(wallets));
  renderWalletInterface(newWallet);
}

// Function to generate a random Ethereum address
function generateAddress() {
  function generateRandomHex(length) {
    let result = '0x';
    const characters = '0123456789abcdef';
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
  }
  return generateRandomHex(40); // Ethereum address is 40 hexadecimal characters starting with "0x"
}

// Render the wallet interface for managing ETH transactions
function renderWalletInterface(wallet) {
  const app = document.getElementById('app');
  app.innerHTML = `
    <h1>Practice Ethereum Wallet User Interface</h1>
    <p>Wallet Address: ${wallet.address}</p>
    <p>Current Balance: ${wallet.balance} ETH</p>
    <input type="number" id="amount" placeholder="Enter amount in ETH" />
    <button onclick="deposit('${wallet.password}')">Deposit ETH</button>
    <button onclick="send('${wallet.password}')">Send ETH</button>
    <button onclick="logout()">Logout</button>
  `;
}

// Handle depositing ETH into the wallet
function deposit(password) {
  const amountInput = document.getElementById('amount');
  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount greater than 0.');
    amountInput.value = '';
    return;
  }
  const wallets = JSON.parse(localStorage.getItem('wallets'));
  const wallet = wallets.find(wallet => wallet.password === password);
  wallet.balance += amount;
  localStorage.setItem('wallets', JSON.stringify(wallets));
  alert(`Deposited ${amount} ETH`);
  renderWalletInterface(wallet);
}

// Helper function to prompt and validate destination Ethereum address
function promptDestinationAddress() {
  const address = prompt("Please enter the destination Ethereum address:");
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    alert("Make sure you are sending to a valid Ethereum address.");
    return null;
  }
  return address;
}

// Helper function to confirm send operation
function confirmSend(amount, address) {
  return confirm(`Are you sure you want to send ${amount} ETH to ${address}?`);
}

// Helper function to retrieve both sender and receiver wallets from local storage
function getWallets(password, destinationAddress) {
  const wallets = JSON.parse(localStorage.getItem('wallets'));
  const senderWallet = wallets.find(wallet => wallet.password === password);
  const destinationWallet = wallets.find(wallet => wallet.address === destinationAddress);
  return { wallets, senderWallet, destinationWallet };
}

// Helper function to check if the sender has sufficient funds
function hasSufficientFunds(wallet, amount) {
  return wallet.balance >= amount;
}

// Handle sending ETH from the wallet
function send(password) {
  console.log("Send button clicked"); // For debugging
  const amountInput = document.getElementById('amount');  
  const amount = parseFloat(amountInput.value);  
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount greater than 0.');  
    amountInput.value = '';  
    return;
  }

  const destinationAddress = promptDestinationAddress();  
  if (!destinationAddress) return;

  const { wallets, senderWallet, destinationWallet } = getWallets(password, destinationAddress);  
  if (!senderWallet || !destinationWallet) {
    alert("One or both addresses do not exist in our system.");  
    return;
  }

  if (!hasSufficientFunds(senderWallet, amount)) {
    alert('Insufficient balance.');  
    return;
  }

  if (!confirmSend(amount, destinationAddress)) {
    alert('Send canceled.');  
    return;
  }

  senderWallet.balance -= amount;  
  destinationWallet.balance += amount;  
  localStorage.setItem('wallets', JSON.stringify(wallets));  

  alert(`Sent ${amount} ETH to ${destinationAddress}`);  
  renderWalletInterface(senderWallet);  // Refresh sender's wallet interface
}

// Log out and return to the initial option screen
function logout() {
  renderInitialOptions();
}
