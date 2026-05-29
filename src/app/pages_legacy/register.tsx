import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Lock, Mail, Shield, User } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../../lib/auth/auth-context";
import { ROLE_CONFIG } from "../../lib/types";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    navigate(ROLE_CONFIG[user.role].defaultRoute, { replace: true });
  }, [isAuthenticated, navigate, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Password confirmation does not match.");
      return;
    }

    setIsSubmitting(true);

    const result = await register({
      fullName: fullName.trim(),
      email: email.trim(),
      password,
    });

    if (!result.success) {
      setErrorMessage(result.error ?? "Unable to create the account.");
      setIsSubmitting(false);
      return;
    }

    if (result.requiresEmailVerification) {
      setSuccessMessage(
        "Registration succeeded. Check your inbox to verify the account before signing in."
      );
      setIsSubmitting(false);
      return;
    }

    navigate(result.redirectTo || "/data-ingestion", { replace: true });
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-8 shadow-2xl">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 shadow-lg">
            <Shield className="h-8 w-8 text-white" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold">Register Staff Account</h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          New staff members are created in Supabase Auth. Profile role defaults to `data_operator`.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="h-12 rounded-xl border-border bg-input-background pl-10"
                placeholder="AXA staff full name"
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-xl border-border bg-input-background pl-10"
                placeholder="name@axa.co.id"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-12 rounded-xl border-border bg-input-background pl-10"
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-foreground">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-12 rounded-xl border-border bg-input-background pl-10"
                placeholder="Repeat the password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/30 transition-all hover:from-purple-600 hover:to-primary"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account
              </>
            ) : (
              <>
                Register
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
