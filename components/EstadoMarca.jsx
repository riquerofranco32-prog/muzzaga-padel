import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import Mascota from "./Mascota";

/**
 * Página de estado con la marca (404, error): header y footer del sitio,
 * la mascota en tamaño M, un título canchero y las salidas.
 */
export default function EstadoMarca({ pose, kicker, title, text, children }) {
  return (
    <>
      <Header />
      <main className="estado-marca">
        <Mascota pose={pose} priority className="estado-marca-mascota" />
        <p className="estado-marca-kicker">{kicker}</p>
        <h1 className="estado-marca-title">{title}</h1>
        <p className="estado-marca-text">{text}</p>
        <div className="estado-marca-actions">{children}</div>
      </main>
      <Footer />
      <BottomNav />
    </>
  );
}
