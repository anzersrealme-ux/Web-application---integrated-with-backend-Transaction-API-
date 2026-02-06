let cart = JSON.parse(localStorage.getItem("cart")) || [];

const summary = document.getElementById("order-summary");
const form = document.getElementById("checkout-form");

function renderSummary() {
  if (cart.length === 0) {
    summary.innerHTML = "<p>Your cart is empty.</p>";
    form.style.display = "none";
    return;
  }

  let total = 0;
  summary.innerHTML = "<h2>Order Summary</h2>";

  cart.forEach(item => {
    total += item.price * item.quantity;

    summary.innerHTML += `
      <p>${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}</p>
    `;
  });

  summary.innerHTML += `<h3>Total: ₹${total}</h3>`;
}

renderSummary();

form.addEventListener("submit", async function(e) {
  e.preventDefault();

  const email = form.querySelector('input[type="email"]').value;
  const phone = form.querySelector('input[placeholder="Phone Number"]').value;

  // Email validation - must be @gmail
  if (!email.endsWith("@gmail.com")) {
    alert("Please use a valid Gmail address (@gmail.com)");
    return;
  }

  // Phone validation - must be exactly 10 digits
  if (!/^\d{10}$/.test(phone)) {
    alert("Phone number must be exactly 10 digits");
    return;
  }

  // Calculate total amount
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
  });

  try {
    // Call serverless API to create checkout session
    const response = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ amount: total })
    });

    const data = await response.json();

    if (data.error) {
      alert("Error: " + data.error);
      return;
    }

    // Redirect to Stripe checkout
    const stripe = Stripe("pk_test_51SuyBNCi9ZPqZOs89lPKzPrVftWAoUEYSWsVktQ0bVpe3i19ik6Wcr8DRJc1nvNuDMn1f1DtOmzyRzGc1oatFvpf00rG3YUMN4");
    stripe.redirectToCheckout({ sessionId: data.id });

  } catch (error) {
    alert("Error processing payment: " + error.message);
  }
});

