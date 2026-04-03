import { ArrowLeft, Layers3 } from "lucide-react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 page-enter">
      <div className="w-full max-w-xl">
        <EmptyState
          action={
            <Link className="button-primary" to="/">
              <ArrowLeft size={16} />
              Back to app
            </Link>
          }
          description="The page you're looking for isn't part of this workspace."
          icon={Layers3}
          title="Page not found"
        />
      </div>
    </div>
  );
}
