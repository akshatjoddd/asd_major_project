import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function PublicLayout() {
  return (
    <div className="site">
      <Header />
      <main className="site__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
