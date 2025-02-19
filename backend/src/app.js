// MÓDULOS NECESARIOS
const express = require('express');
const { engine } = require('express-handlebars');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');

// INICIALIZACIONES
const app = express();
const server = http.createServer(app); // Servidor HTTP para Socket.io
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
}); // ✅ Configuración de CORS para permitir conexiones WebSocket

// CONFIGURACIÓN HANDLEBARS
app.engine('handlebars', engine({
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
  defaultLayout: 'main', // Layout base
  extname: '.handlebars' // Extensión de archivos
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views')); // ✅ Corregida la ruta de las vistas

// Verificar la ruta de las vistas
console.log("Ruta de vistas:", path.join(__dirname, 'views'));

// MIDDLEWARE
app.use(express.static(path.join(__dirname, 'public')));
console.log("🛠️ Sirviendo archivos estáticos desde:", path.join(__dirname, 'public'));
app.use(express.json()); // Parsear JSON en solicitudes POST

// CARGA DE PRODUCTOS DESDE JSON
const productsPath = path.join(__dirname, 'data', 'products.json');
let products = [];
try {
  products = JSON.parse(fs.readFileSync(productsPath, 'utf-8'));
  console.log("📂 Productos cargados desde JSON:", products);
} catch (err) {
  console.log('⚠️ Error al cargar products.json, inicializando lista vacía.');
  products = [];
}

// GUARDAR PRODUCTOS EN JSON
const saveProducts = () => {
  console.log("💾 Guardando productos en products.json");
  fs.writeFileSync(productsPath, JSON.stringify(products, null, 2));
};

// RUTAS
// Vista Home
app.get('/', (req, res) => {
  console.log("🔍 Cargando vista home desde:", path.join(__dirname, 'views', 'home.handlebars'));
  res.render('home', { products, title: 'Lista de Productos' });
});

// Vista WebSocket
app.get('/realtimeproducts', (req, res) => {
  console.log("🔍 Cargando vista realTimeProducts desde:", path.join(__dirname, 'views', 'realTimeProducts.handlebars'));
  res.render('realTimeProducts', { products, title: 'Productos en Tiempo Real' });
});

// WEB SOCKET (Configuración)
io.on('connection', (socket) => {
  console.log('🟢 Cliente conectado via WebSocket con ID:', socket.id);

  // Confirmar que se envían productos al conectar
  console.log("📤 Enviando productos al cliente:", products);
  socket.emit('server:loadProducts', products);

  // Escuchar evento para agregar producto
  socket.on('client:addProduct', (productData) => {
    console.log("📥 Recibiendo solicitud para agregar producto:", productData);
    const newProduct = {
      id: Date.now().toString(), // ID único temporal
      title: productData.title,
      price: productData.price
    };
    products.push(newProduct);
    console.log("✅ Producto agregado a la lista en memoria:", newProduct);
    saveProducts(); // Guardar en products.json
    io.emit('server:newProduct', newProduct);
  });

  // Escuchar evento para eliminar producto
  socket.on('client:deleteProduct', (productId) => {
    console.log("🗑️ Recibiendo solicitud para eliminar producto con ID:", productId);
    products = products.filter(p => p.id !== productId);
    console.log("✅ Producto eliminado de la lista en memoria, nueva lista:", products);
    saveProducts(); // Guardar cambios en products.json
    io.emit('server:updateProducts', products);
  });
});

// INICIAR SERVIDOR
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor en http://localhost:${PORT}`);
});
