import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  ShoppingCart,
  UserRound,
  MapPin,
  Phone,
  Menu,
  ArrowRight,
  ShieldCheck,
  Truck,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  Wifi,
  WifiOff,
  Heart,
  ChevronDown,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";
import "./styles.css";

const CATEGORIES = [
  [
    "Réfrigérateurs",
    "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=400&q=80",
  ],
  [
    "Congélateurs",
    "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=400&q=80",
  ],
  [
    "Climatiseurs",
    "https://images.unsplash.com/photo-1631545806609-5b4f7e7f4d9a?auto=format&fit=crop&w=400&q=80",
  ],
  [
    "Machines à laver",
    "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80",
  ],
  [
    "Cuisinières à gaz",
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80",
  ],
  [
    "Plaques à gaz",
    "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=400&q=80",
  ],
  [
    "Ventilateurs rechargeables",
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80",
  ],
];

const money = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem("batobaye-cart") || "{}");
  } catch {
    return {};
  }
}

function readProducts() {
  try {
    return JSON.parse(localStorage.getItem("batobaye-products") || "[]");
  } catch {
    return [];
  }
}

function readOfflineOrders() {
  try {
    return JSON.parse(localStorage.getItem("batobaye-offline-orders") || "[]");
  } catch {
    return [];
  }
}

function App() {
  const [products, setProducts] = useState(readProducts);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState(readCart);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Tous les produits");
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);

  const [alertInfo, setAlertInfo] = useState(null);
  const [checkout, setCheckout] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("batobaye-user") || "null");
    } catch {
      return null;
    }
  });
  const [authModal, setAuthModal] = useState(null);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [customer, setCustomer] = useState({
    livraison: true,
    phone: "",
    location: "",
  });

  const showAlert = (message, type = "success") => {
    setAlertInfo({ message, type });
    setTimeout(() => {
      setAlertInfo(null);
    }, 6000);
  };

  const loadProducts = () => {
    fetch("http://127.0.0.1:8001/api/produits")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const formatted = data.data.map((p) => ({
            id: p.id,
            name: p.nom_produit,
            category: "Réfrigérateurs",
            price: parseFloat(p.prix),
            old: parseFloat(p.prix) * 1.15,
            image:
              "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=900&q=85",
            badge: "-10%",
            rating: 4.8,
            reviews: 12,
            brand: "Batobaye",
            stock: p.stock,
            description:
              "Produit disponible en stock chez Batobaye Market à Douala.",
            specs: [["Garantie", "1 an"]],
          }));
          setProducts(formatted);
          localStorage.setItem("batobaye-products", JSON.stringify(formatted));
        }
        setLoadingProducts(false);
      })
      .catch((err) => {
        console.warn(
          "Mode hors-ligne : chargement des produits depuis le cache local.",
          err,
        );
        setLoadingProducts(false);
        const cached = readProducts();
        if (cached.length > 0) {
          setProducts(cached);
        } else {
          showAlert(
            "Impossible de joindre le serveur et aucun cache produit trouvé.",
            "error",
          );
        }
      });
  };

  // Synchronisation automatique des commandes enregistrées hors-ligne vers Laravel
  const syncOfflineOrders = async () => {
    const offlineOrders = readOfflineOrders();
    if (offlineOrders.length === 0) return;

    try {
      for (const order of offlineOrders) {
        for (const item of order.payloads) {
          await fetch("http://127.0.0.1:8001/api/cart/add", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(item),
          });
        }
      }
      localStorage.removeItem("batobaye-offline-orders");
      showAlert(
        "Connexion rétablie : Vos commandes hors-ligne ont été synchronisées avec le serveur !",
        "success",
      );
      loadProducts();
    } catch (err) {
      console.error(
        "Erreur lors de la synchronisation des commandes hors-ligne",
        err,
      );
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      syncOfflineOrders();
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (navigator.onLine) {
      syncOfflineOrders();
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.log("Erreur SW", err));
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("batobaye-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user) localStorage.setItem("batobaye-user", JSON.stringify(user));
    else localStorage.removeItem("batobaye-user");
  }, [user]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.stock > 0 &&
          (category === "Tous les produits" || p.category === category) &&
          p.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, category, search],
  );

  const count = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartProducts = products.filter((p) => cart[p.id]);
  const subtotal = cartProducts.reduce(
    (sum, p) => sum + p.price * (cart[p.id] || 0),
    0,
  );

  const openProduct = (p) => {
    setSelectedProduct(p);
    window.location.hash = `produit/${p.id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToCatalog = () => {
    setSelectedProduct(null);
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const add = (p) => {
    const currentQty = cart[p.id] || 0;
    if (currentQty + 1 > p.stock) {
      showAlert(`Stock maximum atteint (${p.stock} disponibles).`, "error");
      return;
    }
    setCart((c) => ({ ...c, [p.id]: currentQty + 1 }));
    showAlert(`${p.name} ajouté au panier`, "success");
  };

  const change = (id, delta) => {
    const product = products.find((p) => p.id === id);
    setCart((c) => {
      const next = { ...c };
      const currentQty = next[id] || 0;
      const newQty = currentQty + delta;

      if (newQty <= 0) {
        delete next[id];
      } else if (product && newQty > product.stock) {
        showAlert(
          `Stock limité ! Maximum disponible : ${product.stock}`,
          "error",
        );
        return c;
      } else {
        next[id] = newQty;
      }
      return next;
    });
  };

  const remove = (id) =>
    setCart((c) => {
      const n = { ...c };
      delete n[id];
      return n;
    });

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint =
      authModal === "login"
        ? "http://127.0.0.1:8001/api/login"
        : "http://127.0.0.1:8001/api/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Erreur d'authentification");

      setUser(data.user);
      setAuthModal(null);
      setAuthForm({ name: "", email: "", password: "" });
      showAlert(
        authModal === "login"
          ? "Connexion réussie !"
          : "Compte créé avec succès !",
        "success",
      );
    } catch (err) {
      showAlert("Erreur : " + err.message, "error");
    }
  };

  const logout = () => {
    setUser(null);
    showAlert("Déconnexion réussie.", "success");
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      showAlert("Veuillez vous connecter pour passer commande.", "error");
      setCheckout(false);
      setAuthModal("login");
      return;
    }
    if (
      customer.livraison &&
      (!customer.phone.trim() || !customer.location.trim())
    ) {
      showAlert(
        "Veuillez remplir le téléphone et le lieu de livraison.",
        "error",
      );
      return;
    }
    if (!count) {
      showAlert("Votre panier est vide.", "error");
      setCheckout(false);
      return;
    }

    const orderPayloads = cartProducts.map((p) => ({
      user_id: user.id,
      id_produit: p.id,
      quantite: cart[p.id],
      mode_livraison: customer.livraison ? 1 : 0,
      telephone: customer.livraison ? customer.phone.trim() : null,
      lieu_livraison: customer.livraison ? customer.location.trim() : null,
    }));

    // Si on est hors-ligne, on enregistre dans le localStorage pour synchronisation ultérieure
    if (!navigator.onLine) {
      const offlineOrders = readOfflineOrders();
      const offlineOrder = {
        reference: `BAT-OFF-${Date.now().toString().slice(-8)}`,
        createdAt: new Date().toISOString(),
        customer: {
          name: user.name,
          phone: customer.livraison
            ? customer.phone.trim()
            : "Retrait en magasin",
          location: customer.livraison
            ? customer.location.trim()
            : "Agence Akwa",
        },
        items: cartProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          quantity: cart[p.id],
        })),
        total: subtotal,
        payloads: orderPayloads,
      };

      offlineOrders.push(offlineOrder);
      localStorage.setItem(
        "batobaye-offline-orders",
        JSON.stringify(offlineOrders),
      );

      setOrderConfirmation(offlineOrder);
      setCheckout(false);
      setCartOpen(false);
      setCart({});
      showAlert(
        "Mode hors-ligne : Commande sauvegardée localement. Elle sera synchronisée dès le retour du réseau !",
        "success",
      );
      return;
    }

    // En ligne : envoi direct au serveur
    try {
      for (const item of orderPayloads) {
        const response = await fetch("http://127.0.0.1:8001/api/cart/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(item),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Erreur lors de la commande.");
        }
      }

      const order = {
        reference: `BAT-${Date.now().toString().slice(-8)}`,
        createdAt: new Date().toISOString(),
        customer: {
          name: user.name,
          phone: customer.livraison
            ? customer.phone.trim()
            : "Retrait en magasin",
          location: customer.livraison
            ? customer.location.trim()
            : "Agence Akwa",
        },
        items: cartProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          quantity: cart[p.id],
        })),
        total: subtotal,
      };

      setOrderConfirmation(order);
      setCheckout(false);
      setCartOpen(false);
      setCart({});
      loadProducts();
      showAlert(
        "Commande validée et enregistrée en base de données !",
        "success",
      );
    } catch (error) {
      showAlert("Erreur : " + error.message, "error");
    }
  };

  return (
    <div className="app">
      {!online && (
        <div className="offline">
          <WifiOff size={15} /> Mode hors ligne — Les produits et votre panier
          restent disponibles. Vos commandes seront synchronisées
          automatiquement au retour d'Internet.
        </div>
      )}
      <header className="topbar">
        <a className="brand" href="#" aria-label="Batobaye Market accueil">
          <span className="brand-icon">
            <ShoppingCart size={29} />
          </span>
          <span>
            <strong>
              Batobaye <em>Market</em>
            </strong>
            <small>Le meilleur de l'électroménager</small>
          </span>
        </a>
        <div className="search">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            aria-label="Rechercher un produit"
          />
          <button aria-label="Rechercher">
            <Search size={20} />
          </button>
        </div>
        <div className="location">
          <MapPin size={21} />
          <span>
            <b>Akwa en face ancienne</b>
            <small>station MRS, Douala</small>
          </span>
        </div>
        <div className="phone">
          <Phone size={19} />
          <span>
            <b>+237 672 027 744</b>
            <small>+237 678 447 922</small>
          </span>
        </div>

        {user ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "#e0f2fe",
              padding: "6px 14px",
              borderRadius: "8px",
            }}
          >
            <UserRound size={18} color="#0284c7" />
            <span
              style={{ fontWeight: "600", color: "#0369a1", fontSize: "14px" }}
            >
              {user.name}
            </span>
            <button
              onClick={logout}
              style={{
                background: "#ef4444",
                color: "#fff",
                border: "none",
                padding: "4px 8px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
              }}
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <button
            className="account"
            onClick={() => setAuthModal("login")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#0284c7",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            <UserRound size={18} />
            <span>Se connecter</span>
          </button>
        )}

        <button className="cart-button" onClick={() => setCartOpen(true)}>
          <ShoppingCart />
          <span>Panier</span>
          {count > 0 && <b className="cart-count">{count}</b>}
        </button>
      </header>

      <nav className="nav">
        <button
          className="allcats"
          onClick={() => setCategory("Tous les produits")}
        >
          <Menu size={19} /> Toutes les catégories <ChevronDown size={14} />
        </button>
        <a className="active" href="#accueil">
          Accueil
        </a>
        <a href="#produits">Produits</a>
        <a href="#promotions">Promotions</a>
        <a href="#magasins">Nos magasins</a>
        <a href="#contact">Contact</a>
        <span className="nav-status">
          {online ? (
            <>
              <Wifi size={14} /> En ligne
            </>
          ) : (
            <>
              <WifiOff size={14} /> Hors ligne
            </>
          )}
        </span>
      </nav>

      <main>
        {selectedProduct ? (
          <section className="product-detail-page">
            <button className="back-catalog" onClick={backToCatalog}>
              ← Retour aux produits
            </button>
            <div className="detail-layout">
              <div className="detail-photo">
                <span className="discount">{selectedProduct.badge}</span>
                <img src={selectedProduct.image} alt={selectedProduct.name} />
              </div>
              <div className="detail-copy">
                <span className="eyebrow">
                  {selectedProduct.category.toUpperCase()}
                </span>
                <small className="product-brand">{selectedProduct.brand}</small>
                <h1>{selectedProduct.name}</h1>
                <div className="rating">
                  <span>★★★★★</span>{" "}
                  <small>
                    {selectedProduct.rating}/5 · {selectedProduct.reviews} avis
                  </small>
                </div>
                <div className="detail-prices">
                  <strong>{money(selectedProduct.price)}</strong>
                  <del>{money(selectedProduct.old)}</del>
                  <span>{selectedProduct.badge}</span>
                </div>
                <p className="detail-description">
                  {selectedProduct.description}
                </p>
                <h3>Détails du produit</h3>
                <table className="spec-table">
                  <tbody>
                    <tr>
                      <th>Stock disponible</th>
                      <td>{selectedProduct.stock} unité(s)</td>
                    </tr>
                    <tr>
                      <th>Disponibilité</th>
                      <td>En stock (Batobaye Market)</td>
                    </tr>
                    <tr>
                      <th>Livraison</th>
                      <td>Douala — Akwa, Bonanjo, etc.</td>
                    </tr>
                    <tr>
                      <th>Paiement</th>
                      <td>Espèces, Orange Money ou MTN MoMo</td>
                    </tr>
                  </tbody>
                </table>
                <div className="detail-actions">
                  <button
                    className="add detail-add"
                    onClick={() => {
                      add(selectedProduct);
                      setCartOpen(true);
                    }}
                  >
                    <ShoppingCart size={17} /> Ajouter au panier
                  </button>
                  <a className="detail-phone" href="tel:+237672027744">
                    Contacter le magasin : 672 027 744
                  </a>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <>
            <section className="hero" id="accueil">
              <div className="hero-copy">
                <span className="eyebrow">LE CONFORT À BON PRIX</span>
                <h1>
                  Électroménager
                  <br />
                  <em>de qualité</em>
                </h1>
                <p>pour un quotidien meilleur</p>
                <button
                  onClick={() =>
                    document
                      .getElementById("produits")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Découvrir maintenant <ArrowRight size={18} />
                </button>
              </div>
              <div className="hero-products">
                <img
                  src="https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=400&q=80"
                  alt="Réfrigérateur"
                />
                <img
                  src="https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=400&q=80"
                  alt="Machine à laver"
                />
                <img
                  src="https://images.unsplash.com/photo-1631545806609-5b4f7e7f4d9a?auto=format&fit=crop&w=400&q=80"
                  alt="Climatiseur"
                />
              </div>
              <div className="hero-benefits">
                <span>
                  <ShieldCheck /> Produits de qualité
                </span>
                <span>
                  <Truck /> Livraison rapide
                </span>
                <span>
                  <CreditCard /> Paiement flexible
                </span>
              </div>
            </section>

            <section
              className="category-row"
              aria-label="Catégories de produits"
            >
              {CATEGORIES.map(([name, img]) => (
                <button
                  key={name}
                  className={
                    category === name ? "category selected" : "category"
                  }
                  onClick={() =>
                    setCategory(category === name ? "Tous les produits" : name)
                  }
                >
                  <img src={img} alt="" />
                  <span>{name}</span>
                </button>
              ))}
            </section>

            <section className="section-head" id="produits">
              <div>
                <span className="eyebrow">NOTRE SÉLECTION</span>
                <h2>
                  {category === "Tous les produits"
                    ? "Produits populaires"
                    : category}
                </h2>
              </div>
              <span className="result-count">{filtered.length} produit(s)</span>
            </section>

            {loadingProducts ? (
              <p style={{ textAlign: "center", padding: "40px" }}>
                Chargement des produits depuis le serveur...
              </p>
            ) : filtered.length ? (
              <section className="product-grid">
                {filtered.map((p) => (
                  <article className="product-card" key={p.id}>
                    <span className="discount">{p.badge}</span>
                    <button
                      className="heart"
                      aria-label="Favori"
                      onClick={() => showAlert("Ajouté aux favoris", "success")}
                    >
                      <Heart size={17} />
                    </button>
                    <div className="product-image">
                      <img src={p.image} alt={p.name} />
                    </div>
                    <div className="product-info">
                      <small className="product-brand">{p.brand}</small>
                      <h3>{p.name}</h3>
                      <div className="rating">
                        <span>★★★★★</span>{" "}
                        <small>
                          ({p.reviews}) · Stock : {p.stock}
                        </small>
                      </div>
                      <div className="prices">
                        <strong>{money(p.price)}</strong>
                        <del>{money(p.old)}</del>
                      </div>
                      <button className="add" onClick={() => openProduct(p)}>
                        <ShoppingCart size={16} /> Voir le produit
                      </button>
                    </div>
                  </article>
                ))}
                <aside className="delivery-card" id="promotions">
                  <div>
                    <span className="eyebrow">BATOBAYE VOUS LIVRE</span>
                    <h3>
                      Livraison
                      <br />
                      <em>à Douala</em>
                    </h3>
                    <p>Rapide et sécurisée, à domicile ou en agence.</p>
                  </div>
                  <Truck size={48} />
                  <div className="delivery-foot">
                    <CreditCard size={19} /> Paiement à la livraison · Orange
                    Money · MTN MoMo
                  </div>
                </aside>
              </section>
            ) : (
              <div className="empty">
                <Search size={32} />
                <h3>Aucun produit trouvé</h3>
                <p>
                  Tous les produits sont épuisés ou aucun résultat ne correspond
                  à votre recherche.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("Tous les produits");
                  }}
                >
                  Voir tous les produits
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Alerte centrale (Verte pour succès, Rouge pour erreur) */}
      {alertInfo && (
        <div className={`center-alert ${alertInfo.type}`}>
          {alertInfo.type === "success" ? (
            <CheckCircle2 size={24} />
          ) : (
            <AlertCircle size={24} />
          )}
          <span>{alertInfo.message}</span>
        </div>
      )}

      {/* Modal d'authentification */}
      {authModal && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setAuthModal(null);
          }}
        >
          <form className="checkout-modal" onSubmit={handleAuth}>
            <div className="drawer-head">
              <h2>
                {authModal === "login"
                  ? "Connexion Client"
                  : "Inscription Client"}
              </h2>
              <button
                type="button"
                className="icon-button"
                onClick={() => setAuthModal(null)}
              >
                <X />
              </button>
            </div>
            {authModal === "register" && (
              <label>
                Nom complet
                <input
                  required
                  value={authForm.name}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, name: e.target.value })
                  }
                  placeholder="Votre nom"
                />
              </label>
            )}
            <label>
              Email
              <input
                required
                type="email"
                value={authForm.email}
                onChange={(e) =>
                  setAuthForm({ ...authForm, email: e.target.value })
                }
                placeholder="votre@email.com"
              />
            </label>
            <label>
              Mot de passe
              <input
                required
                type="password"
                value={authForm.password}
                onChange={(e) =>
                  setAuthForm({ ...authForm, password: e.target.value })
                }
                placeholder="******"
              />
            </label>
            <button
              className="checkout"
              type="submit"
              style={{ marginTop: "15px" }}
            >
              {authModal === "login" ? "Se connecter" : "S'inscrire"}
            </button>
          </form>
        </div>
      )}

      {/* Panier */}
      {cartOpen && (
        <div
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCartOpen(false);
          }}
        >
          <aside className="drawer">
            <div className="drawer-head">
              <div>
                <h2>Votre panier</h2>
                <small>{count} article(s)</small>
              </div>
              <button
                className="icon-button"
                onClick={() => setCartOpen(false)}
              >
                <X />
              </button>
            </div>
            <div className="drawer-items">
              {cartProducts.length === 0 ? (
                <div className="empty-cart">
                  <ShoppingCart size={40} />
                  <h3>Votre panier est vide</h3>
                  <p>Ajoutez un produit pour commencer.</p>
                </div>
              ) : (
                cartProducts.map((p) => (
                  <div className="cart-item" key={p.id}>
                    <img src={p.image} alt={p.name} />
                    <div className="cart-item-info">
                      <b>{p.name}</b>
                      <strong>{money(p.price)}</strong>
                      <div className="quantity">
                        <button
                          onClick={() => change(p.id, -1)}
                          aria-label="Diminuer"
                        >
                          <Minus size={14} />
                        </button>
                        <span>{cart[p.id]}</span>
                        <button
                          onClick={() => change(p.id, 1)}
                          aria-label="Augmenter"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <button
                      className="remove"
                      onClick={() => remove(p.id)}
                      aria-label="Retirer"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="drawer-bottom">
              <div className="summary-line">
                <span>Sous-total</span>
                <b>{money(subtotal)}</b>
              </div>
              <div className="summary-line total">
                <span>Total estimatif</span>
                <strong>{money(subtotal)}</strong>
              </div>
              <button
                className="checkout"
                disabled={!count}
                onClick={() => {
                  if (!user) {
                    setCartOpen(false);
                    setAuthModal("login");
                  } else {
                    setCheckout(true);
                  }
                }}
              >
                Passer la commande <ArrowRight size={18} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Modal de finalisation de commande (Livraison Oui / Non) */}
      {checkout && (
        <div
          className="overlay checkout-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCheckout(false);
          }}
        >
          <form className="checkout-modal" onSubmit={placeOrder}>
            <div className="drawer-head">
              <h2>Finaliser la commande</h2>
              <button
                type="button"
                className="icon-button"
                onClick={() => setCheckout(false)}
                aria-label="Fermer"
              >
                <X />
              </button>
            </div>
            <p className="modal-copy">
              Client connecté : <b>{user?.name}</b> ({user?.email})
            </p>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                margin: "20px 0",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={customer.livraison}
                onChange={(e) =>
                  setCustomer({ ...customer, livraison: e.target.checked })
                }
                style={{ width: "20px", height: "20px" }}
              />
              <span>Souhaitez-vous vous faire livrer ?</span>
            </label>

            {customer.livraison && (
              <>
                <label>
                  Téléphone de contact
                  <input
                    required
                    type="tel"
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                    placeholder="6XX XX XX XX"
                  />
                </label>
                <label>
                  Lieu de livraison / Quartier
                  <input
                    required
                    value={customer.location}
                    onChange={(e) =>
                      setCustomer({ ...customer, location: e.target.value })
                    }
                    placeholder="Ex. Akwa, Douala"
                  />
                </label>
              </>
            )}

            <div className="modal-total">
              Total estimatif <b>{money(subtotal)}</b>
            </div>
            <button className="checkout" type="submit">
              Confirmer la commande
            </button>
          </form>
        </div>
      )}

      {/* Confirmation de commande */}
      {orderConfirmation && (
        <div className="overlay confirmation-overlay">
          <section className="confirmation-modal">
            <div className="confirmation-icon">
              <CheckCircle2 size={34} />
            </div>
            <h2>Commande validée !</h2>
            <p className="modal-copy">
              Votre commande a été traitée avec succès.
            </p>
            <div className="order-reference">
              <span>Référence de commande</span>
              <strong>{orderConfirmation.reference}</strong>
            </div>
            <div className="order-customer">
              <b>{orderConfirmation.customer.name}</b>
              <span>{orderConfirmation.customer.phone}</span>
              <span>{orderConfirmation.customer.location}</span>
            </div>
            <div className="order-lines">
              {orderConfirmation.items.map((item) => (
                <div className="order-line" key={item.id}>
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <b>{money(item.price * item.quantity)}</b>
                </div>
              ))}
            </div>
            <div className="modal-total">
              <span>Total estimatif</span>
              <b>{money(orderConfirmation.total)}</b>
            </div>
            <button
              className="checkout"
              onClick={() => {
                setOrderConfirmation(null);
                setSelectedProduct(null);
                history.replaceState(
                  null,
                  "",
                  window.location.pathname + window.location.search,
                );
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Retour à la boutique
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
