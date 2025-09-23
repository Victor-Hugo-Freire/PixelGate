const API_BASE_URL = "http://localhost:3001/api";

async function getCurrentUser() {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: "include",
    });
    if (res.ok) return await res.json();
    return null;
  } catch {
    return null;
  }
}

function luhnCheck(cardNumber) {
  let sum = 0;
  let shouldDouble = false;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function renderPaymentPage() {
  const section = document.getElementById("paymentSection");
  section.innerHTML = `
    <div class="payment-title">Escolha a forma de pagamento</div>
    <div class="payment-methods">
      <div class="payment-method" id="pixMethod" tabindex="0">
        <img src="../../assets/imgs/QrCodePix.jpeg" alt="Pix QR Code" />
        <span>Pix</span>
      </div>
      <div class="payment-method" id="cardMethod" tabindex="0">
        <div style="width:80px;height:80px;background:#eee;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:2em;color:#888;">💳</div>
        <span>Cartão</span>
      </div>
    </div>
    <form class="payment-form" id="paymentForm" style="display:none;">
      <label for="cardNumber">Número do cartão</label>
      <input type="text" id="cardNumber" maxlength="19" placeholder="1234 5678 9012 3456" required />
      <label for="cardName">Nome no cartão</label>
      <input type="text" id="cardName" maxlength="32" placeholder="Nome completo" required />
      <label for="cardExpiry">Validade (MM/AA)</label>
      <input type="text" id="cardExpiry" maxlength="5" placeholder="MM/AA" required />
      <label for="cardCVC">CVC</label>
      <input type="text" id="cardCVC" maxlength="4" placeholder="CVC" required />
      <button type="submit" class="payment-btn" id="payBtn">Pagar</button>
      <div id="paymentError" class="payment-error"></div>
    </form>
    <div id="pixBox" style="display:none;">
      <img src="../../assets/imgs/QrCodePix.jpeg" class="qr-code-img" alt="QR Code Pix" />
      <div class="payment-success">Escaneie o QR Code para pagar via Pix.</div>
      <button class="payment-btn" id="pixPayBtn" style="margin-top:1em;">Confirmar pagamento</button>
    </div>
    <div id="paymentSuccess" class="payment-success"></div>
  `;

  let selected = null;
  const pixMethod = document.getElementById("pixMethod");
  const cardMethod = document.getElementById("cardMethod");
  const paymentForm = document.getElementById("paymentForm");
  const pixBox = document.getElementById("pixBox");
  const paymentSuccess = document.getElementById("paymentSuccess");
  const paymentError = document.getElementById("paymentError");

  pixMethod.onclick = () => {
    selected = "pix";
    pixMethod.classList.add("selected");
    cardMethod.classList.remove("selected");
    paymentForm.style.display = "none";
    pixBox.style.display = "block";
    paymentSuccess.textContent = "";
    paymentError.textContent = "";
  };
  cardMethod.onclick = () => {
    selected = "card";
    cardMethod.classList.add("selected");
    pixMethod.classList.remove("selected");
    paymentForm.style.display = "flex";
    pixBox.style.display = "none";
    paymentSuccess.textContent = "";
    paymentError.textContent = "";
  };

  document.getElementById("pixPayBtn").onclick = async () => {
    paymentSuccess.textContent = "";
    paymentError.textContent = "";
    await processPayment("pix");
  };

  paymentForm.onsubmit = async (e) => {
    e.preventDefault();
    paymentSuccess.textContent = "";
    paymentError.textContent = "";
    const cardNumber = paymentForm.cardNumber.value.replace(/\s+/g, "");
    const cardName = paymentForm.cardName.value.trim();
    const cardExpiry = paymentForm.cardExpiry.value.trim();
    const cardCVC = paymentForm.cardCVC.value.trim();

    if (!/^\d{16}$/.test(cardNumber) || !luhnCheck(cardNumber)) {
      paymentError.textContent = "Número do cartão inválido.";
      return;
    }
    if (!cardName || cardName.length < 5) {
      paymentError.textContent = "Nome no cartão inválido.";
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      paymentError.textContent = "Validade inválida.";
      return;
    }
    if (!/^\d{3,4}$/.test(cardCVC)) {
      paymentError.textContent = "CVC inválido.";
      return;
    }
    await processPayment("card");
  };
}

async function processPayment(method) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "../login/login.html?redirect=payment/payment.html";
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/payment/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ user_id: user.user_id }),
    });
    const data = await res.json();
    if (res.ok) {
      document.getElementById("paymentSuccess").textContent =
        "Pagamento realizado com sucesso! Jogos adicionados à sua biblioteca.";
      setTimeout(() => {
        window.location.href = "../library/library.html";
      }, 1800);
    } else {
      document.getElementById("paymentError").textContent =
        data.error || "Erro ao processar pagamento.";
    }
  } catch (err) {
    document.getElementById("paymentError").textContent =
      "Erro de conexão ao processar pagamento.";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = "../login/login.html?redirect=payment/payment.html";
    return;
  }
  renderPaymentPage();
});
