"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import "./login.css";

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
        <div className="login-container">
            <div className="login-header">
                <h1 className="login-title">Welcome back</h1>

                <p className="login-subtitle">Login to your account</p>
            </div>

            <div className="login-card">
                <form
                    className="login-form"
                    onSubmit={handleSubmit(submitFunction)}
                    autoComplete="off"
                >
                    <div className="login-field">
                        <label className="login-label">Email</label>

                        <input
                            {...register("email")}
                            type="text"
                            placeholder="you@example.com"
                            autoComplete="username"
                            className="login-input"
                        />

                        <p className="login-error">{errors.email?.message}</p>
                    </div>

                    <div className="login-field">
                        <label className="login-label">Password</label>

                        <input
                            {...register("password")}
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="login-input"
                        />

                        <p className="login-error">
                            {errors.password?.message}
                        </p>
                    </div>

                    <button
                        disabled={isSubmitting}
                        className="login-button"
                    >
                        {isSubmitting ? "Loading..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}
