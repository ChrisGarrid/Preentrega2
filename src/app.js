// MÓDULOS NECESARIOS
const express = require('express');
const { engine } = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

// INICIALIZACIONES
const app = express();
const server = http.createServer(app); // Servidor HTTP para Socket.io
const io = socketIO(server); // Instancia de Socket.io

// CONFIGURACIÓN HANDLEBARS
app.engine('handlebars', engine({
  defaultLayout: 'main', // Layout base
  extname: '.handlebars' // Extensión de archivos
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); // Asegura ruta absoluta

// Verificar la ruta de las vistas
console.log("Ruta de vistas:", path.join(__dirname, 'src', 'views'));

// MIDDLEWARE
app.use(express.static(path.join(__dirname, 'public'))); // Carpeta para archivos estáticos
app.use(express.json()); // Parsear JSON en solicitudes POST

// DATOS EN MEMORIA (SIMULACIÓN DE BASE DE DATOS)
let products = [
  { id: '1', title: 'Laptop', price: 1000 },
  { id: '2', title: 'Mouse', price: 50 }
];

// RUTAS
// Vista Home (HTTP tradicional)
app.get('/', (req, res) => {
  console.log("🔍 Cargando vista home desde:", path.join(__dirname, 'views', 'home.handlebars'));
  res.render('home', {
    products: products,
    title: 'Lista de Productos'
  });
});

// Vista WebSocket
app.get('/realtimeproducts', (req, res) => {
  console.log("🔍 Cargando vista realTimeProducts desde:", path.join(__dirname, 'src', 'views', 'realTimeProducts.handlebars'));
  res.render('realTimeProducts', {
    products: products,
    title: 'Productos en Tiempo Real'
  });
});

// WEB SOCKET (Configuración)
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado via WebSocket');

  // Enviar lista inicial al cliente
  socket.emit('server:loadProducts', products);

  // Escuchar evento para agregar producto
socket.on('client:addProduct', (productData) => {
    console.log("🛠️ Recibiendo producto:", productData); // Debug
    const newProduct = {
        id: Date.now().toString(),
        title: productData.title,
        price: Number(productData.price)
    };
    products.push(newProduct);
    io.emit('server:newProduct', newProduct);
});

  // Escuchar evento para eliminar producto
  socket.on('client:deleteProduct', (productId) => {
    products = products.filter(p => p.id !== productId);
    io.emit('server:updateProducts', products); // Nueva lista completa
  });
});

// INICIAR SERVIDOR
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
