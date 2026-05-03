import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LangContext";

export function NotFound() {
  const { dict } = useLang();
  return (
    <div className="container-page py-24 text-center space-y-4">
      <h1 className="text-5xl font-extrabold glow-text">404</h1>
      <p className="opacity-70">{dict.common.notFound}</p>
      <Link to="/" className="btn-primary inline-flex">
        {dict.common.goHome}
      </Link>
    </div>
  );
}
