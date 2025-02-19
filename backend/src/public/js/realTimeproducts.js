// ✅ Inicializar WebSocket
const socket = io();

// Confirmar conexión WebSocket
socket.on("connect", () => {
    console.log("✅ Cliente conectado a WebSocket con ID:", socket.id);
});

// Confirmar conexión WebSocket
socket.on("connect", () => {
    console.log("✅ Cliente conectado a WebSocket con ID:", socket.id);
});

// Agregar producto
// ✅ Manejar el evento de agregar producto
document.getElementById('formAddProduct').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = e.target.title.value.trim();
    const price = parseFloat(e.target.price.value);
  
    // Validación básica
    if (!title || isNaN(price)) {
      alert('Datos inválidos');
      return;
    }
  
    socket.emit('client:addProduct', { title, price });
    e.target.reset();
});

// Eliminar producto (evento delegado)
// ✅ Manejar la eliminación de productos
document.getElementById('productList').addEventListener('click', (e) => {
  if (e.target.classList.contains('btnDelete')) {
    const productId = e.target.closest('li').dataset.id;
    socket.emit('client:deleteProduct', productId);
  }
});

// Actualizar lista
// ✅ Escuchar actualizaciones de productos desde el servidor
socket.on('server:updateProducts', (products) => {
    console.log("🔄 Lista de productos actualizada:", products);
  const productList = document.getElementById('productList');
  productList.innerHTML = products.map(product => `
    <li data-id="${product.id}">
      ${product.title} - $${product.price}
      <button class="btnDelete">Eliminar</button>
    </li>
  `).join('');
});
