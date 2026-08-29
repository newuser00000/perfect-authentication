"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import "../auth.css";

export default function AuthRegister() {
    const registerSchema = z
        .object({
            username: z.string(),
            email: z.string().email("Invalid email format"),
            password: z.string().min(8, "Password must be at least 8 characters long"),
            confirmPassword: z.string().min(8, "Confirm Password must be at least 8 characters long"),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        });

    type RegisterFormFields = z.infer<typeof registerSchema>;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormFields>({
        resolver: zodResolver(registerSchema),
    });

    const submitFunction: SubmitHandler<RegisterFormFields> = (data) => {
        console.log(data);
    };

    return (
        <div className="auth-container">
            <div className="auth-header">
                <h1 className="auth-title">Welcome</h1>

                <p className="auth-subtitle">Create your account</p>
            </div>

            <div className="auth-card">
                <form
                    className="auth-form"
                    onSubmit={handleSubmit(submitFunction)}
                    autoComplete="off"
                >
                    <div className="auth-field">
                        <label className="auth-label">Username</label>

                        <input
                            {...register("username")}
                            type="text"
                            placeholder="Username"
                            className="auth-input"
                        />

                        <p className="auth-error">{errors.username?.message}</p>
                    </div>

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

                    <div className="auth-field">
                        <label className="auth-label">Confirm Password</label>

                        <input
                            {...register("confirmPassword")}
                            type="password"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            className="auth-input"
                        />

                        <p className="auth-error">
                            {errors.confirmPassword?.message}
                        </p>
                    </div>

                    <button disabled={isSubmitting} className="auth-button">
                        {isSubmitting ? "Loading..." : "Register"}
                    </button>
                </form>
            </div>
        </div>
    );
}
