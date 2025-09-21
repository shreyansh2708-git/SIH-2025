export interface JWTPayload {
    userId: string;
    email: string;
    role: 'CITIZEN' | 'ADMIN';
}
export declare const generateToken: (payload: JWTPayload) => string;
export declare const verifyToken: (token: string) => JWTPayload;
//# sourceMappingURL=jwt.d.ts.map