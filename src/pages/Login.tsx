import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // --- FIX: State now uses uppercase UserRole type ---
  const [role, setRole] = useState<UserRole>('CITIZEN');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // --- FIX: `login` now returns the user object ---
      const user = await login(email, password, role);
      if (user) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name || user.email}!`,
        });
        
        // --- FIX: Redirect is based on the ACTUAL authenticated user role ---
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/citizen');
        }
      } else {
        toast({
          title: "Login failed",
          description: error || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-civic flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4 shadow-civic">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-white">Samadhan</h1>
          <p className="text-white/90 mt-2">Report and manage community issues</p>
        </div>

        <Card className="shadow-elevated border-0">
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your civic platform account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="your.email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" required minLength={6} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select your role" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {/* --- FIX: SelectItem values are now uppercase --- */}
                    <SelectItem value="CITIZEN">Citizen</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Admin: admin@civic.gov | admin123</p>
              <p>Citizen: citizen@example.com | citizen123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
