const socket = io();

// Cargar productos al conectar
socket.on('server:loadProducts', (products) => {
  console.log('📦 Productos recibidos:', products);
  updateProductList(products);
});

// Agregar producto
document.getElementById('formAddProduct').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = e.target.title.value.trim();
    const price = parseFloat(e.target.price.value);

    if (!title || isNaN(price)) {
        alert('Datos inválidos');
        return;
    }

    console.log("📤 Enviando producto al servidor:", { title, price }); // Debug
    socket.emit('client:addProduct', { title, price });
    e.target.reset();
});

// Recibir nuevo producto del servidor y actualizar la lista
socket.on('server:newProduct', (product) => {
    console.log("📥 Producto recibido del servidor:", product); // Debug
    const productList = document.getElementById('productList');
    const li = document.createElement('li');
    li.dataset.id = product.id;
    li.innerHTML = `${product.title} - $${product.price} <button class="btnDelete">Eliminar</button>`;
    productList.appendChild(li);
});
// Eliminar producto
document.getElementById('productList').addEventListener('click', (e) => {
  if (e.target.classList.contains('btnDelete')) {
    const productId = e.target.closest('li').dataset.id;
    socket.emit('client:deleteProduct', productId);
  }
});

// Actualizar lista de productos
socket.on('server:updateProducts', (products) => {
  updateProductList(products);
});

function updateProductList(products) {
  const productList = document.getElementById('productList');
  productList.innerHTML = products.map(product => `
    <li data-id="${product.id}">
      ${product.title} - $${product.price}
      <button class="btnDelete">Eliminar</button>
    </li>
  `).join('');
}
