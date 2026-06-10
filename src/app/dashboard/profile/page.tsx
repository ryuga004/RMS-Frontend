"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getApiErrorMessage } from "@/lib/api";
import { getProfile, updateProfileImage, updateProfile } from "@/lib/api/users";
import { RootState } from "@/lib/redux/store";
import type { UserProfileResponse } from "@/types";
import { Calendar, Camera, Mail, MapPin, Phone, ShieldCheck, User as UserIcon, Building, Map as MapIcon, Globe2, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  
  // Minimal states
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states for editable fields
  const [phoneNo, setPhoneNo] = useState("");
  const [address, setAddress] = useState({
    localAddress: "",
    city: "",
    state: "",
    country: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user?.id || user.id === "0") {
      setLoading(false);
      return;
    }
    const uid = Number(user.id);
    if (Number.isNaN(uid) || uid <= 0) {
      setLoading(false);
      return;
    }
    
    getProfile(uid)
      .then((data) => {
        setProfile(data);
        setPhoneNo(data.phoneNo || "");
        setAddress({
          localAddress: data.address?.localAddress || "",
          city: data.address?.city || "",
          state: data.address?.state || "",
          country: data.address?.country || "",
        });
      })
      .catch(() => toast.error("Could not load profile"))
      .finally(() => setLoading(false));
  }, [mounted, user?.id]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    const uid = Number(user.id);
    if (Number.isNaN(uid)) return;
    setUploading(true);
    try {
      await updateProfileImage(uid, file);
      toast.success("Profile image updated.");
      const updatedProfile = await getProfile(uid);
      setProfile(updatedProfile);
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSaveChanges = async () => {
    if (!user?.id) return;
    const uid = Number(user.id);
    setSaving(true);
    try {
      const payload: Partial<UserProfileResponse> = {
        phoneNo,
        address,
      };
      const updatedProfile = await updateProfile(uid, payload);
      setProfile(updatedProfile);
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-5xl mx-auto pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90">My Profile</h1>
        <p className="text-muted-foreground w-full">
          Manage your personal information and adjust your public details easily. 
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-border bg-card/60 p-12 flex flex-col items-center justify-center gap-4 text-muted-foreground shadow-sm">
           <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
           <p className="font-medium">Loading your beautiful profile...</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12 md:items-start">
          
          {/* Left Side: Immutable Info */}
          <Card className="lg:col-span-5 xl:col-span-4 shadow-xl border-border/50 bg-gradient-to-b from-card to-card/50 backdrop-blur-md overflow-hidden min-h-[480px] flex flex-col relative rounded-2xl">
            {/* Background design */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-tr from-primary/20 via-primary/10 to-transparent z-0 pointer-events-none" />
            
            <CardHeader className="text-center pt-10 pb-6 relative z-10 flex flex-col items-center gap-4 border-b border-border/30">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-[6px] border-background shadow-2xl transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage src={profile?.profileImageUrl ?? undefined} className="object-cover" />
                  <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                    {(profile?.name ?? user?.name)?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={uploading}
                />
                <Button
                  size="icon"
                  className="absolute bottom-1 right-1 h-10 w-10 rounded-full shadow-lg border-2 border-background bg-primary hover:bg-primary/90 transition-transform hover:scale-110"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4 text-primary-foreground" />
                </Button>
              </div>
              
              <div className="space-y-1.5 flex flex-col items-center mt-2">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  {profile?.name ?? user?.name}
                  {profile?.isVerified && (
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                  )}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold tracking-wide uppercase bg-secondary/80 text-secondary-foreground shadow-sm">
                    {profile?.roleName || user?.role || "USER"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-6 flex-grow relative z-10 bg-card/20">
              <div className="space-y-5 px-2">
                <div className="flex items-center gap-4 text-sm group">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Email Address</span>
                    <span className="font-medium text-foreground">{profile?.email ?? user?.email}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm group">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">Member Since</span>
                    <span className="font-medium text-foreground">
                      {profile?.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Side: Editable Details */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <Card className="shadow-lg border-border/50 bg-card/60 backdrop-blur-md rounded-2xl flex flex-col h-full">
              <CardHeader className="border-b border-border/40 pb-5">
                <CardTitle className="flex items-center gap-2 text-xl font-bold">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
                <CardDescription className="text-[15px] mt-1.5">
                  Update your contact details and address below. Make sure to save your changes.
                </CardDescription>
              </CardHeader>
              
              <CardContent className="grid gap-8 p-6 sm:p-8 flex-grow">
                {/* Contact Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground/80 pb-2 border-b border-border/30">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    Contact
                  </h3>
                  <div className="grid gap-2.5 max-w-md pt-2">
                    <Label htmlFor="phoneNo" className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                    <Input
                      id="phoneNo"
                      placeholder="+1 (555) 000-0000"
                      value={phoneNo}
                      onChange={(e) => setPhoneNo(e.target.value)}
                      className="bg-background border-border/80 focus-visible:ring-primary/40 h-11 transition-all shadow-sm rounded-lg"
                    />
                  </div>
                </div>

                {/* Address Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground/80 pb-2 border-b border-border/30">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    Address Details
                  </h3>
                  
                  <div className="grid gap-5 md:grid-cols-2 pt-2">
                     <div className="grid gap-2.5 md:col-span-2">
                      <Label htmlFor="localAddress" className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 ">
                        <MapIcon className="h-3.5 w-3.5" /> Street Address
                      </Label>
                      <Input
                        id="localAddress"
                        placeholder="123 Main St, Apt 4B"
                        value={address.localAddress}
                        onChange={(e) => setAddress({ ...address, localAddress: e.target.value })}
                        className="bg-background border-border/80 focus-visible:ring-primary/40 h-11 transition-all shadow-sm rounded-lg"
                      />
                    </div>
                    
                    <div className="grid gap-2.5">
                      <Label htmlFor="city" className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5" /> City
                      </Label>
                      <Input
                        id="city"
                        placeholder="New York"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="bg-background border-border/80 focus-visible:ring-primary/40 h-11 transition-all shadow-sm rounded-lg"
                      />
                    </div>
                    
                    <div className="grid gap-2.5">
                      <Label htmlFor="state" className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" /> State / Province
                      </Label>
                      <Input
                        id="state"
                        placeholder="NY"
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        className="bg-background border-border/80 focus-visible:ring-primary/40 h-11 transition-all shadow-sm rounded-lg"
                      />
                    </div>
                    
                    <div className="grid gap-2.5 md:col-span-2 max-w-sm">
                      <Label htmlFor="country" className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                        <Globe2 className="h-3.5 w-3.5" /> Country
                      </Label>
                      <Input
                        id="country"
                        placeholder="United States"
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        className="bg-background border-border/80 focus-visible:ring-primary/40 h-11 transition-all shadow-sm rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="bg-muted/20 border-t border-border/40 py-5 px-6 sm:px-8 mt-auto rounded-b-2xl flex justify-end">
                <Button 
                   onClick={handleSaveChanges} 
                   disabled={saving || loading}
                   className="min-w-[150px] h-11 gap-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all text-sm"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
