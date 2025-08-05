import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowRight, BarChart3, Calendar, CheckCircle, Clock, FileText, Shield, Users } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    const features = [
        {
            icon: Users,
            title: 'Manajemen Karyawan',
            description: 'Kelola profil, data personal, dan informasi karyawan dalam satu dashboard terpusat',
        },
        {
            icon: Clock,
            title: 'Absensi & Kehadiran',
            description: 'Sistem absensi digital dengan tracking waktu kerja yang akurat dan fleksibel',
        },
        {
            icon: FileText,
            title: 'Sistem Payroll',
            description: 'Otomatisasi penggajian dengan perhitungan pajak, tunjangan, dan potongan yang tepat',
        },
        {
            icon: BarChart3,
            title: 'Analytics & Report',
            description: 'Dashboard analitik dengan insight performa karyawan dan produktivitas tim',
        },
        {
            icon: Shield,
            title: 'Keamanan Data',
            description: 'Perlindungan data karyawan dengan enkripsi tingkat enterprise dan backup otomatis',
        },
        {
            icon: Calendar,
            title: 'Manajemen Cuti',
            description: 'Sistem pengajuan cuti online dengan approval workflow yang dapat dikustomisasi',
        },
    ];

    const benefits = [
        'Hemat waktu proses HR hingga 75%',
        'Data karyawan tersentralisasi & aman',
        'Laporan real-time dan akurat',
        'Interface yang user-friendly',
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* nav */}
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 shadow-sm">
                                <Users className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-800">Simple HRIS</span>
                        </div>

                        <nav className="flex items-center space-x-6">
                            {auth.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="cursor-pointer rounded-xl bg-slate-700 px-6 py-2.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link
                                        href={route('login')}
                                        className="font-medium text-slate-600 transition-colors duration-200 hover:text-slate-800"
                                    >
                                        Masuk
                                    </Link>
                                    <button className="cursor-not-allowed rounded-xl bg-slate-700 px-6 py-2.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-slate-800 hover:shadow-md">
                                        Mulai Gratis
                                    </button>
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* hero */}
            <section className="bg-gradient-to-b from-white to-slate-50 px-6 py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="mx-auto max-w-4xl text-center">
                        <div className="mb-8 inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                            <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500"></span>
                            Trusted by 500+ Companies
                        </div>

                        <h1 className="mb-6 text-5xl leading-tight font-bold text-slate-800 lg:text-6xl">
                            HRIS yang Mudah &
                            <span className="bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent"> Powerful</span>
                        </h1>

                        <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-slate-600">
                            Kelola seluruh aspek HR perusahaan Anda dengan platform yang intuitif. Dari onboarding hingga payroll, semuanya
                            terintegrasi sempurna.
                        </p>

                        <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
                            <button className="flex cursor-pointer items-center justify-center space-x-2 rounded-xl bg-slate-700 px-8 py-4 font-medium text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl">
                                <span>Mulai Trial Gratis</span>
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            <button className="cursor-pointer rounded-xl border border-slate-300 px-8 py-4 font-medium text-slate-700 transition-all duration-200 hover:border-slate-400 hover:bg-white hover:text-slate-800 hover:shadow-md">
                                Lihat Demo
                            </button>
                        </div>

                        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-center space-x-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                                    <span className="text-sm font-medium text-slate-700">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* features */}
            <section className="px-6 py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-16 text-center">
                        <h2 className="mb-4 text-4xl font-bold text-slate-800">Fitur Lengkap untuk HR Modern</h2>
                        <p className="mx-auto max-w-3xl text-xl text-slate-600">
                            Semua tools yang Anda butuhkan untuk mengelola sumber daya manusia dengan efisien dan efektif
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature, index) => {
                            const IconComponent = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="group rounded-2xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
                                >
                                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 transition-all duration-300 group-hover:from-slate-200 group-hover:to-slate-300">
                                        <IconComponent className="h-7 w-7 text-slate-700" />
                                    </div>
                                    <h3 className="mb-3 text-xl font-semibold text-slate-800">{feature.title}</h3>
                                    <p className="leading-relaxed text-slate-600">{feature.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* stats */}
            <section className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-24">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-12 text-center">
                        <h3 className="mb-4 text-4xl font-bold text-white">Dipercaya Perusahaan Terbaik</h3>
                        <p className="mx-auto max-w-2xl text-xl text-slate-300">
                            Bergabunglah dengan ekosistem perusahaan yang telah merasakan transformasi digital HR
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
                        <div className="p-6 text-center">
                            <div className="mb-2 text-5xl font-bold text-white">500+</div>
                            <div className="text-lg text-slate-300">Perusahaan Aktif</div>
                        </div>
                        <div className="p-6 text-center">
                            <div className="mb-2 text-5xl font-bold text-white">50k+</div>
                            <div className="text-lg text-slate-300">Karyawan Terdaftar</div>
                        </div>
                        <div className="p-6 text-center">
                            <div className="mb-2 text-5xl font-bold text-white">99.9%</div>
                            <div className="text-lg text-slate-300">System Uptime</div>
                        </div>
                        <div className="p-6 text-center">
                            <div className="mb-2 text-5xl font-bold text-white">4.9★</div>
                            <div className="text-lg text-slate-300">Rating Pengguna</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* cta */}
            <section className="bg-gradient-to-b from-slate-50 to-white px-6 py-24">
                <div className="mx-auto max-w-4xl text-center">
                    <h3 className="mb-6 text-4xl font-bold text-slate-800">Siap Mengoptimalkan HR Perusahaan?</h3>
                    <p className="mx-auto mb-10 max-w-2xl text-xl text-slate-600">
                        Mulai transformasi digital HR hari ini. Dapatkan akses penuh selama 14 hari, tanpa kartu kredit, tanpa komitmen.
                    </p>

                    <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
                        <button className="cursor-pointer rounded-xl bg-slate-700 px-10 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl">
                            Mulai Trial 14 Hari
                        </button>
                        <button className="cursor-pointer rounded-xl border-2 border-slate-300 px-10 py-4 text-lg font-semibold text-slate-700 transition-all duration-200 hover:border-slate-400 hover:bg-white hover:text-slate-800 hover:shadow-lg">
                            Jadwalkan Demo
                        </button>
                    </div>

                    <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span>Setup dalam 5 menit</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span>Support premium 24/7</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                            <span>Data migration gratis</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* footer */}
            <footer className="border-t border-slate-200 bg-white px-6 py-16">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
                        <div className="col-span-1 md:col-span-2">
                            <div className="mb-6 flex items-center space-x-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-900">
                                    <Users className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-xl font-bold text-slate-800">Simple HRIS</span>
                            </div>
                            <p className="mb-6 max-w-md leading-relaxed text-slate-600">
                                Platform HRIS modern yang membantu perusahaan mengelola sumber daya manusia dengan lebih efisien dan strategis.
                            </p>
                            <div className="flex space-x-4">
                                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-slate-100 transition-colors duration-200 hover:bg-slate-200">
                                    <span className="font-semibold text-slate-600">f</span>
                                </div>
                                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-slate-100 transition-colors duration-200 hover:bg-slate-200">
                                    <span className="font-semibold text-slate-600">in</span>
                                </div>
                                <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-slate-100 transition-colors duration-200 hover:bg-slate-200">
                                    <span className="font-semibold text-slate-600">@</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="mb-4 font-semibold text-slate-800">Produk</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="text-slate-600 transition-colors duration-200 hover:text-slate-800">
                                        Manajemen Karyawan
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-slate-600 transition-colors duration-200 hover:text-slate-800">
                                        Sistem Absensi
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-slate-600 transition-colors duration-200 hover:text-slate-800">
                                        Payroll
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-slate-600 transition-colors duration-200 hover:text-slate-800">
                                        Analytics
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-slate-600 transition-colors duration-200 hover:text-slate-800">
                                        Integrasi
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="mb-4 font-semibold text-slate-800">Dukungan</h4>
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="text-slate-600 transition-colors duration-200 hover:text-slate-800">
                                        Dokumentasi
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-slate-600 transition-colors duration-200 hover:text-slate-800">
                                        Tutorial
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-slate-600 transition-colors duration-200 hover:text-slate-800">
                                        Support Center
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-slate-600 transition-colors duration-200 hover:text-slate-800">
                                        FAQ
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-slate-600 transition-colors duration-200 hover:text-slate-800">
                                        Kontak
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-200 pt-8 text-center">
                        <p className="text-slate-500">© 2025 Simple HRIS. All rights reserved. Made with ❤️.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
