// Carta real de la cantina. Compartida entre la landing (CantinaSection) y
// el punto de venta del admin: antes vivía duplicada a mano en cada lugar,
// con precios como string ("$18.000") que había que reparsear para sumar.
// Acá el precio es numérico; cada consumidor lo formatea como necesite.

export const MENU_ITEMS = [
  // Cocina / Buffet
  { category: "buffet", name: "Pizza muzza", price: 18000 },
  { category: "buffet", name: "Pizza napo", price: 20000 },
  { category: "buffet", name: "Pizza especial", price: 22000 },
  { category: "buffet", name: "Pizza S/TACC", price: 18000, tag: "Sin TACC" },
  { category: "buffet", name: "Pizza vegana", price: 25000, tag: "Vegana" },
  { category: "buffet", name: "Tostados", price: 14000 },
  { category: "buffet", name: "Empanada (unidad)", price: 2000 },
  { category: "buffet", name: "Mila", price: 20000 },
  { category: "buffet", name: "Porción dulce", price: 10000 },
  { category: "buffet", name: "Brownie S/TACC", price: 8000, tag: "Sin TACC" },

  // Bebidas sin alcohol
  { category: "bebidas-sin", name: "Agua 500ml", price: 2000 },
  { category: "bebidas-sin", name: "Agua 850ml", price: 3000 },
  { category: "bebidas-sin", name: "Agua 1.5L", price: 4000 },
  { category: "bebidas-sin", name: "Coca-Cola 500ml", price: 4000 },
  { category: "bebidas-sin", name: "Coca-Cola 1.5L", price: 7000 },
  { category: "bebidas-sin", name: "Sprite 500ml", price: 3000 },
  { category: "bebidas-sin", name: "Sprite 1.5L", price: 6000 },
  { category: "bebidas-sin", name: "Fanta 500ml", price: 3000 },
  { category: "bebidas-sin", name: "Cepita 1L", price: 4000 },
  { category: "bebidas-sin", name: "H2OH 500ml", price: 2000 },
  { category: "bebidas-sin", name: "Levité 1.5L", price: 4000 },
  { category: "bebidas-sin", name: "Gatorade 500ml", price: 4000 },
  { category: "bebidas-sin", name: "Gatorade 750ml", price: 5000 },
  { category: "bebidas-sin", name: "Suerox", price: 4000 },
  { category: "bebidas-sin", name: "Monster 473ml", price: 4000 },
  { category: "bebidas-sin", name: "Red Bull 250ml", price: 4000 },
  {
    category: "bebidas-sin",
    name: "Stella Artois 0% 330ml",
    price: 4000,
    tag: "Sin alcohol",
  },

  // Bebidas con alcohol
  { category: "bebidas-con", name: "Quilmes 473ml", price: 4000 },
  { category: "bebidas-con", name: "Stella Artois 473ml", price: 4000 },
  {
    category: "bebidas-con",
    name: "Stella Artois Retornable 975ml",
    price: 10000,
  },
  { category: "bebidas-con", name: "Corona 330ml", price: 4000 },
  { category: "bebidas-con", name: "Corona 710ml", price: 10000 },
  { category: "bebidas-con", name: "Heineken litro", price: 10000 },
  { category: "bebidas-con", name: "Patagonia IPA 710ml", price: 9000 },
  { category: "bebidas-con", name: "Fernet y Coca", price: 12000 },

  // Kiosco
  { category: "kiosco", name: "Café chico", price: 3000 },
  { category: "kiosco", name: "Café grande", price: 4000 },
  { category: "kiosco", name: "Yerba", price: 4000 },
  { category: "kiosco", name: "9 de Oro", price: 3000 },
  { category: "kiosco", name: "Alfajor", price: 3000 },
  { category: "kiosco", name: "Barrita Integral", price: 2000 },
  { category: "kiosco", name: "Cintitas", price: 3000 },
  { category: "kiosco", name: "Gomitas", price: 1000 },
  { category: "kiosco", name: "Kit-Kat", price: 3000 },
  { category: "kiosco", name: "Oreo", price: 4000 },
  { category: "kiosco", name: "Paseo", price: 3000 },
  { category: "kiosco", name: "Pepas", price: 3000 },
  { category: "kiosco", name: "Pringles", price: 5000 },
  { category: "kiosco", name: "Rhodesia", price: 1000 },
  { category: "kiosco", name: "Saladix", price: 3000 },
  { category: "kiosco", name: "Trío", price: 3000 },
  { category: "kiosco", name: "Turrón", price: 500 },
  { category: "kiosco", name: "Tostex proteicas", price: 4000 },
  { category: "kiosco", name: "Pelotas de pádel", price: 12000 },
  { category: "kiosco", name: "Cubre grip liso", price: 3000 },
  { category: "kiosco", name: "Cubre grip perforado", price: 4000 },
  { category: "kiosco", name: "Cubre grip relieve", price: 5000 },
];

export const MENU_CATEGORIES = [
  { id: "all", label: "Todo" },
  { id: "buffet", label: "🍕 Cocina" },
  { id: "bebidas-sin", label: "🥤 Bebidas sin alcohol" },
  { id: "bebidas-con", label: "🍺 Bebidas con alcohol" },
  { id: "kiosco", label: "🍫 Kiosco" },
];
