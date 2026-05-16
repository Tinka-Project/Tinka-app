import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRightLeft, Check, Copy, Download, Dna, Power, ShieldCheck, Wallet, X } from 'lucide-react';

export type AgentProfile = 'Ahorrador' | 'Freelancer' | 'Gastador Nocturno' | 'Balanceado';

interface Props {
	open: boolean;
	onClose: () => void;
	profile: AgentProfile;
	agentId: string;
	evolutionLevel: number;
	savingsStreak: number;
	isDisciplined: boolean;
	lastHash: string | null;
	wallets: WalletProfile[];
	activeWalletId: string;
	onWalletChange: (walletId: string) => void;
}

export interface WalletProfile {
	id: string;
	name: string;
	address: string;
	network: string;
	balance: number;
	lastSync: string;
	status: 'Active' | 'Standby' | 'Cold';
}

export function OnChainAgentPanel({
	open,
	onClose,
	profile,
	agentId,
	evolutionLevel,
	savingsStreak,
	isDisciplined,
	lastHash,
	wallets,
	activeWalletId,
	onWalletChange,
}: Props) {
	const [isDisconnectHover, setIsDisconnectHover] = useState(false);
	const [isWalletPickerOpen, setIsWalletPickerOpen] = useState(false);
	const neuralTraits = useMemo(() => {
		const baseTraits = [
			{ id: 't1', label: profile, intensity: Math.min(100, 45 + savingsStreak * 8) },
			{ id: 't2', label: 'Autocontrol', intensity: isDisciplined ? 78 : 42 },
			{ id: 't3', label: 'Ritmo de gasto', intensity: isDisciplined ? 62 : 82 },
			{ id: 't4', label: 'Adaptación', intensity: 48 + evolutionLevel * 5 },
		];
		return baseTraits;
	}, [evolutionLevel, isDisciplined, profile, savingsStreak]);
	const activeWallet = wallets.find((wallet) => wallet.id === activeWalletId) || wallets[0];

	const handleCopyWalletAddress = async () => {
		if (!activeWallet) return;
		await navigator.clipboard.writeText(activeWallet.address);
	};

	const handleExportIdentity = () => {
		const identityPayload = {
			schema: 'Arkive.neural.identity.v1',
			agentId,
			profile,
			evolutionLevel,
			savingsStreak,
			encryptedMetadata: {
				behaviorPattern: profile,
				storage: 'sidechain.encrypted.soulbound',
			},
			exportedAt: new Date().toISOString(),
			lastAnchoredHash: lastHash,
		};

		const blob = new Blob([JSON.stringify(identityPayload, null, 2)], {
			type: 'application/json',
		});
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = `Arkive-identity-${agentId.slice(0, 6)}.json`;
		anchor.click();
		URL.revokeObjectURL(url);
	};

	const handleDisconnectDevice = () => {
		setIsDisconnectHover(false);
		onClose();
	};

	return (
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
					/>

					<motion.aside
						initial={{ x: '100%', opacity: 0.8 }}
						animate={{ x: 0, opacity: 1 }}
						exit={{ x: '100%', opacity: 0.8 }}
						transition={{ type: 'spring', stiffness: 260, damping: 28 }}
						className="fixed right-0 top-0 z-[60] h-full w-full max-w-md overflow-y-auto overscroll-contain border-l border-cyan-300/20 bg-[radial-gradient(circle_at_30%_20%,#0f1f33_0%,#06080f_48%,#020306_100%)] p-6 pb-24 backdrop-blur-2xl"
						style={{ WebkitOverflowScrolling: 'touch' }}
					>
						<div className="flex min-h-full flex-col">
							<div className="mb-5 flex items-center justify-between">
								<div>
									<p className="text-xs uppercase tracking-[0.3em] text-cyan-200/65">The Neural Vault</p>
									<h2 className="text-xl text-white">Conciencia Financiera Autónoma</h2>
								</div>
								<button
									onClick={onClose}
									className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-cyan-100 transition-colors hover:bg-white/10"
								>
									<X size={18} />
								</button>
							</div>

							<div className="rounded-3xl border border-cyan-200/20 bg-white/[0.03] p-5 shadow-[0_0_0_1px_rgba(125,211,252,0.08),inset_0_0_40px_rgba(14,116,144,0.08)]">
								<NeuralVaultOrb
									isDisciplined={isDisciplined}
									evolutionLevel={evolutionLevel}
									isDisconnectHover={isDisconnectHover}
									traits={neuralTraits}
								/>
								<p className="mt-4 text-center text-sm text-cyan-100/85">{profile}</p>
								<p className="mt-1 text-center text-[10px] font-thin tracking-[0.32em] text-cyan-100/28">
									{lastHash || '0x0000000000000000'}
								</p>
							</div>

							<div className="mt-5 rounded-3xl border border-cyan-200/15 bg-white/[0.03] p-4 shadow-[inset_0_0_24px_rgba(14,116,144,0.08)]">
								<div className="mb-3 text-xs uppercase tracking-[0.22em] text-cyan-100/60">Memoria NFT</div>
								<div className="space-y-3">
									{neuralTraits.map((trait) => (
										<div key={trait.id} className="rounded-2xl border border-cyan-200/15 bg-black/25 px-3 py-2">
											<div className="mb-2 flex items-center justify-between text-xs text-cyan-50/80">
												<div className="flex items-center gap-2">
													<Dna size={12} className="text-cyan-200/80" />
													<span>{trait.label}</span>
												</div>
												<span className="text-cyan-100/55">{trait.intensity}%</span>
											</div>
											<div className="h-1.5 rounded-full bg-cyan-950/60">
												<motion.div
													initial={{ width: 0 }}
													animate={{ width: `${trait.intensity}%` }}
													transition={{ duration: 0.7 }}
													className="h-full rounded-full bg-gradient-to-r from-cyan-300/65 to-cyan-100/85"
												/>
											</div>
										</div>
									))}
								</div>
							</div>

							<div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/5 p-4">
								<p className="text-sm text-cyan-50">
									Este es tu cerebro financiero y seguro en la nube descentralizada.
								</p>
								<p className="mt-2 text-xs text-cyan-100/70">
									Agent-ID {agentId} · Nivel {evolutionLevel} · Metas selladas {savingsStreak}
								</p>
							</div>

							<div className="mt-5 rounded-3xl border border-cyan-200/15 bg-white/[0.03] p-4 shadow-[inset_0_0_24px_rgba(14,116,144,0.08)]">
								<div className="mb-4 flex items-center justify-between gap-3">
									<div>
										<div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-cyan-100/60">
											<Wallet size={12} />
											Billetera en Blockchain
										</div>
										<div className="mt-1 text-sm text-cyan-50">{activeWallet?.name || 'Wallet principal'}</div>
									</div>
									<div className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-1 text-[11px] text-emerald-100">
										{activeWallet?.status || 'Active'}
									</div>
								</div>

								<div className="space-y-3 rounded-2xl border border-cyan-200/15 bg-black/25 p-3">
									<div className="flex items-center justify-between gap-3">
										<div>
											<div className="text-[11px] uppercase tracking-[0.18em] text-cyan-100/45">Address</div>
											<div className="mt-1 font-mono text-xs text-cyan-50/80">{activeWallet?.address}</div>
										</div>
										<button
											onClick={handleCopyWalletAddress}
											className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/20 bg-white/5 text-cyan-100 transition-colors hover:bg-white/10"
											aria-label="Copiar dirección"
										>
											<Copy size={14} />
										</button>
									</div>

									<div className="grid grid-cols-2 gap-3 text-xs">
										<div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
											<div className="text-cyan-100/45">Network</div>
											<div className="mt-1 text-cyan-50">{activeWallet?.network}</div>
										</div>
										<div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
											<div className="text-cyan-100/45">Balance</div>
											<div className="mt-1 text-cyan-50">Bs {activeWallet?.balance.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
										</div>
										<div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
											<div className="text-cyan-100/45">Last Sync</div>
											<div className="mt-1 text-cyan-50">{activeWallet?.lastSync}</div>
										</div>
										<div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
											<div className="text-cyan-100/45">Ledger</div>
											<div className="mt-1 text-cyan-50">Verified</div>
										</div>
									</div>
								</div>

								<div className="mt-3">
									<button
										onClick={() => setIsWalletPickerOpen((value) => !value)}
										className="flex w-full items-center justify-between rounded-2xl border border-cyan-300/20 bg-cyan-300/5 px-4 py-3 text-sm text-cyan-50 transition-colors hover:bg-cyan-300/10"
									>
										<span className="flex items-center gap-2"><ArrowRightLeft size={15} /> Cambiar billetera</span>
										<span className="text-xs text-cyan-100/60">{wallets.length} disponibles</span>
									</button>

									<AnimatePresence>
										{isWalletPickerOpen && (
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: 'auto' }}
												exit={{ opacity: 0, height: 0 }}
												className="mt-3 overflow-hidden rounded-2xl border border-cyan-200/15 bg-black/20 p-2"
											>
												{wallets.map((wallet) => {
													const isActive = wallet.id === activeWalletId;
													return (
														<button
															key={wallet.id}
															onClick={() => {
																onWalletChange(wallet.id);
																setIsWalletPickerOpen(false);
															}}
															className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition-colors ${isActive ? 'bg-cyan-300/10' : 'hover:bg-white/5'}`}
														>
															<div>
																<div className="text-sm text-cyan-50">{wallet.name}</div>
																<div className="text-[11px] text-cyan-100/50">{wallet.network} · {wallet.status}</div>
															</div>
															{isActive ? <Check size={15} className="text-cyan-200" /> : <div className="h-2 w-2 rounded-full bg-white/30" />}
														</button>
													);
												})}
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</div>

							<div className="mt-auto grid gap-3 pt-6">
								<button
									onClick={handleExportIdentity}
									className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-50 transition-colors hover:bg-cyan-300/20"
								>
									<Download size={16} />
									Exportar Identidad Neural
								</button>

								<button
									onClick={handleDisconnectDevice}
									onMouseEnter={() => setIsDisconnectHover(true)}
									onMouseLeave={() => setIsDisconnectHover(false)}
									onTouchStart={() => setIsDisconnectHover(true)}
									onTouchEnd={() => setIsDisconnectHover(false)}
									className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-300/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-100 transition-colors hover:bg-rose-400/20"
								>
									<Power size={16} />
									Desconectar de este Dispositivo
								</button>
							</div>
						</div>
					</motion.aside>
				</>
			)}
		</AnimatePresence>
	);
}

function NeuralVaultOrb({
	isDisciplined,
	evolutionLevel,
	isDisconnectHover,
	traits,
}: {
	isDisciplined: boolean;
	evolutionLevel: number;
	isDisconnectHover: boolean;
	traits: Array<{ id: string; label: string; intensity: number }>;
}) {
	const nodePositions = [
		{ x: 14, y: 28 },
		{ x: 26, y: 12 },
		{ x: 78, y: 16 },
		{ x: 88, y: 40 },
		{ x: 24, y: 76 },
		{ x: 74, y: 84 },
		{ x: 48, y: 8 },
		{ x: 8, y: 56 },
		{ x: 92, y: 62 },
	];

	const dnaNodes = [
		{ x: 26, y: 36 },
		{ x: 35, y: 22 },
		{ x: 64, y: 24 },
		{ x: 76, y: 40 },
	];

	return (
		<div className="relative flex h-64 items-center justify-center overflow-hidden rounded-2xl border border-cyan-200/20 bg-[#03070d]/75">
			{nodePositions.map((point, index) => (
				<motion.div
					key={`constellation-${index}`}
					className="absolute h-1.5 w-1.5 rounded-full bg-cyan-100/75"
					style={{ left: `${point.x}%`, top: `${point.y}%` }}
					animate={{
						y: [0, index % 2 === 0 ? -7 : 7, 0],
						opacity: [0.35, 0.9, 0.35],
					}}
					transition={{ duration: 3 + index * 0.2, repeat: Infinity }}
				/>
			))}

			<motion.div
				animate={{
					boxShadow: [
						'0 0 24px rgba(34,211,238,0.15)',
						isDisciplined ? '0 0 48px rgba(34,211,238,0.38)' : '0 0 20px rgba(244,63,94,0.24)',
						'0 0 24px rgba(34,211,238,0.15)',
					],
				}}
				transition={{ duration: 2.4, repeat: Infinity }}
				className="absolute h-40 w-40 rounded-full border border-cyan-200/30"
			/>

			<motion.div
				className="relative h-36 w-36 rounded-full border border-cyan-100/35 bg-gradient-to-br from-cyan-200/20 via-cyan-400/10 to-cyan-900/20"
				animate={{
					scale: isDisconnectHover ? 0.7 : [1, 1.04, 1],
					opacity: isDisconnectHover ? 0.25 : 1,
					rotate: isDisciplined ? 360 : [0, 14, -12, 6, 0],
				}}
				transition={
					isDisciplined
						? { scale: { duration: 2.6, repeat: Infinity }, rotate: { duration: 16, repeat: Infinity, ease: 'linear' } }
						: { duration: 2.5, repeat: Infinity }
				}
			>
				<motion.div
					className="absolute left-1/2 top-1/2 rounded-full border border-cyan-50/85 bg-cyan-100/20"
					style={{ transform: 'translate(-50%, -50%)', width: 24 + evolutionLevel * 1.8, height: 24 + evolutionLevel * 1.8 }}
					animate={{
						width: [24 + evolutionLevel * 1.8, 32 + evolutionLevel * 1.8, 24 + evolutionLevel * 1.8],
						height: [24 + evolutionLevel * 1.8, 32 + evolutionLevel * 1.8, 24 + evolutionLevel * 1.8],
					}}
					transition={{ duration: 2, repeat: Infinity }}
				/>

				{!isDisciplined && (
					<>
						{[...Array(8)].map((_, i) => (
							<motion.div
								key={`fragment-${i}`}
								className="absolute h-2 w-2 rounded-sm bg-rose-200/70"
								style={{ left: `${18 + i * 8}%`, top: `${24 + (i % 3) * 18}%` }}
								animate={{
									x: [0, i % 2 === 0 ? 11 : -9, 0],
									y: [0, i % 2 === 0 ? -8 : 10, 0],
									opacity: [0.35, 0.82, 0.35],
								}}
								transition={{ duration: 1.8 + i * 0.15, repeat: Infinity }}
							/>
						))}
					</>
				)}
			</motion.div>

			{dnaNodes.map((node, index) => (
				<motion.div
					key={`dna-node-${index}`}
					className="absolute"
					style={{ left: `${node.x}%`, top: `${node.y}%` }}
				>
					<motion.div
						className="absolute left-1/2 top-1/2 h-px w-20 origin-left bg-gradient-to-r from-cyan-200/45 to-transparent"
						style={{ transform: `translateY(-50%) rotate(${18 + index * 37}deg)` }}
					/>
					<motion.div
						className="relative z-10 h-2.5 w-2.5 rounded-full bg-cyan-100"
						animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
						transition={{ duration: 2 + index * 0.3, repeat: Infinity }}
					/>
				</motion.div>
			))}

			{isDisconnectHover && (
				<div className="pointer-events-none absolute inset-0">
					{[...Array(20)].map((_, i) => (
						<motion.div
							key={`particle-${i}`}
							className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-cyan-100/80"
							initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
							animate={{
								x: Math.cos((i / 20) * Math.PI * 2) * (48 + (i % 4) * 10),
								y: Math.sin((i / 20) * Math.PI * 2) * (48 + (i % 5) * 8),
								opacity: 0,
								scale: 0,
							}}
							transition={{ duration: 0.8, ease: 'easeOut' }}
						/>
					))}
				</div>
			)}

			<div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.18em] text-cyan-100/38">
				{traits.slice(0, 2).map((trait) => trait.label).join(' • ')}
			</div>
		</div>
	);
}
