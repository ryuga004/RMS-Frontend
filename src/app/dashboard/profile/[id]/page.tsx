"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProfileByUserId } from "@/lib/api/users";
import { getApiErrorMessage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
    User, Mail, Phone, MapPin, 
    Calendar, ShieldCheck, 
    CheckCircle2, XCircle
} from "lucide-react";
import { toast } from "sonner";

export default function UserProfileView() {
    const { id } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getProfileByUserId(Number(id));
                setProfile(data);
            } catch (err) {
                toast.error(getApiErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 animate-pulse">
                <p className="text-muted-foreground text-lg">Loading Profile...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20">
                <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                <h1 className="text-2xl font-bold">Profile not found</h1>
                <p className="text-muted-foreground">The user profile you are looking for does not exist.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
                <CardContent className="relative px-8 pb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 gap-6">
                        <Avatar className="w-32 h-32 border-4 border-background shadow-xl ring-1 ring-border/50">
                            <AvatarImage src={profile.profileImageUrl} />
                            <AvatarFallback className="text-4xl">
                                <User className="w-16 h-16 opacity-20" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">{profile.name}</h1>
                                {profile.isVerified && (
                                    <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20 gap-1.5 px-3 py-0.5">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Verified
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-muted-foreground font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Mail className="w-4 h-4" /> {profile.email}
                                </div>
                                <div className="flex items-center gap-1.5 capitalize">
                                    <ShieldCheck className="w-4 h-4" /> {profile.roleName}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                    <Card className="border-border/50 bg-card/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Direct Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Phone</p>
                                <p className="font-medium flex items-center gap-2 truncate">
                                    <Phone className="w-3.5 h-3.5 opacity-50" />
                                    {profile.phoneNo || "Not provided"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Joined On</p>
                                <p className="font-medium flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 opacity-50" />
                                    {new Date(profile.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card className="border-border/50 bg-card/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                Location Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl m-6">
                            {profile.address ? (
                                <div className="text-left space-y-3">
                                    <div className="p-3 bg-secondary/50 rounded-lg">
                                        <p className="text-foreground font-medium">{profile.address.localAddress}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">City</p>
                                            <p className="font-medium">{profile.address.city}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">State</p>
                                            <p className="font-medium">{profile.address.state}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">Country</p>
                                            <p className="font-medium">{profile.address.country}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p>No address details provided by this user.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
