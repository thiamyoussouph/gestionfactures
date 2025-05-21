// "use client";

// import { useState } from "react";
// import { addMultipleStockMovements } from "@/app/actions";
// import { MovementType } from "@prisma/client";

// export default function StockMovementForm({
//   productId,
//   shopId,
//   onSuccess,
//   onClose,
// }: {
//   productId: string;
//   shopId: string;
//   onSuccess: () => void;
//   onClose: () => void;
// }) {
//   const [quantity, setQuantity] = useState(0);
//   const [type, setType] = useState<MovementType>("ENTRY");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError("");

//     if (quantity <= 0) {
//       setError("La quantité doit être supérieure à 0");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       await addMultipleStockMovements([
//         {
//           productId,
//           quantity,
//           shopId,
//           type,
//         },
//       ]);
//       onSuccess();
//     } catch (err) {
//       console.error(err);
//       setError("Erreur lors de l'ajout du mouvement de stock");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <h3 className="text-lg font-semibold">Ajouter un mouvement de stock</h3>

//       <div className="form-control">
//         <label className="label">
//           <span className="label-text">Type de mouvement</span>
//         </label>
//         <select
//           className="select select-bordered"
//           value={type}
//           onChange={(e) => setType(e.target.value as MovementType)}
//         >
//           <option value="ENTRY">Entrée</option>
//           <option value="EXIT">Sortie</option>
//           <option value="ADJUSTMENT">Ajustement</option>
//         </select>
//       </div>

//       <div className="form-control">
//         <label className="label">
//           <span className="label-text">Quantité</span>
//         </label>
//         <input
//           type="number"
//           className="input input-bordered"
//           value={quantity}
//           onChange={(e) => setQuantity(Number(e.target.value))}
//           min={1}
//         />
//       </div>

//       {error && <p className="text-error text-sm">{error}</p>}

//       <div className="flex justify-end gap-2">
//         <button type="button" className="btn btn-ghost" onClick={onClose}>
//           Annuler
//         </button>
//         <button type="submit" className="btn btn-primary" disabled={isLoading}>
//           {isLoading ? "Enregistrement..." : "Valider"}
//         </button>
//       </div>
//     </form>
//   );
// }
