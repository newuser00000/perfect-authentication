"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import "../auth.css";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must atleast contain 8 characters"),
});

type LoginFormFields = z.infer<typeof loginSchema>;

export default function AuthLogin() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormFields>({
        resolver: zodResolver(loginSchema),
    });

    const submitFunction: SubmitHandler<LoginFormFields> = (data) => {
        console.log(data);
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h1 className="auth-title">Welcome back</h1>

                <p className="auth-subtitle">Login to your account</p>
            </div>

            <div className="auth-card">
                <form
                    className="auth-form"
                    onSubmit={handleSubmit(submitFunction)}
                    autoComplete="off"
                >
                    <div className="auth-field">
                        <label className="auth-label">Email</label>

                        <input
                            {...register("email")}
                            type="text"
                            placeholder="you@example.com"
                            autoComplete="username"
                            className="auth-input"
                        />

                        <p className="auth-error">{errors.email?.message}</p>
                    </div>

                    <div className="auth-field">
                        <label className="auth-label">Password</label>

                        <input
                            {...register("password")}
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="auth-input"
                        />

                        <p className="auth-error">{errors.password?.message}</p>
                    </div>

                    <button disabled={isSubmitting} className="auth-button">
                        {isSubmitting ? "Loading..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}
