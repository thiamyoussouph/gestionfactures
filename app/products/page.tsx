"use client";

import React, { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Toast } from "primereact/toast";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Toolbar } from "primereact/toolbar";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { ProgressSpinner } from "primereact/progressspinner";
import { FileUpload } from "primereact/fileupload";
import { Badge } from "primereact/badge";
import { Product } from "@/type";
import {
  createProduct,
  getProductsByShop,
  updateProduct,
  deleteProduct as deleteProductFromDb,
  createCategory,
  getCategoriesByShop,
} from "@/app/actions";
import AppShell from "@/app/components/AppShell";

const emptyProduct: Product = {
  id: "",
  name: "",
  price: 0,
  quantity: 0,
  barcode: "",
  imageUrl: "",
  categoryId: "",
  shopId: "",
  createdAt: new Date(),
  updatedAt: new Date(),
  category: { id: "", name: "", shopId: "" },
};

export default function ProductsPage() {
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [product, setProduct] = useState<Product>(emptyProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<Product[]>>(null);
  const fileUploadRef = useRef<FileUpload>(null);

  useEffect(() => {
    if (selectedShop) {
      setLoading(true);
      Promise.all([
        getProductsByShop(selectedShop),
        getCategoriesByShop(selectedShop)
      ])
        .then(([productsData, categoriesData]) => {
          setProducts(productsData);
          setCategories(categoriesData);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedShop, refreshKey]);

  const openNew = () => {
    setProduct({ ...emptyProduct, shopId: selectedShop || "" });
    setProductDialog(true);
    if (fileUploadRef.current) {
      fileUploadRef.current.clear();
    }
  };

  const hideDialog = () => {
    setProductDialog(false);
    setImageFile(null);
  };

  const saveProduct = async () => {
    if (!product.name.trim()) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: "Le nom du produit est requis",
        life: 3000,
      });
      return;
    }

    try {
      let imageUrl = product.imageUrl;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "product_photos");

        const response = await fetch("https://api.cloudinary.com/v1_1/dlebhesqu/image/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        imageUrl = data.secure_url;
      }

      if (!product.id) {
        await createProduct({
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          imageUrl: imageUrl ?? undefined,
          barcode: product.barcode || undefined,
          categoryId: product.categoryId,
          shopId: product.shopId,
        });
      } else {
        await updateProduct(product.id, {
          name: product.name,
          price: product.price,
         
          imageUrl: imageUrl ?? undefined,
          barcode: product.barcode || undefined,
          categoryId: product.categoryId,
        });
      }

      toast.current?.show({
        severity: "success",
        summary: "Succès",
        detail: product.id ? "Produit modifié" : "Produit ajouté",
        life: 3000,
      });

      setRefreshKey((prev) => prev + 1);
      setProductDialog(false);
      setImageFile(null);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err.message || "Une erreur est survenue",
        life: 5000,
      });
    }
  };

  const deleteProduct = async (product: Product) => {
    try {
      await deleteProductFromDb(product.id);
      toast.current?.show({ 
        severity: "success", 
        summary: "Succès", 
        detail: "Produit supprimé", 
        life: 3000 
      });
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      toast.current?.show({
        severity: "error",
        summary: "Erreur",
        detail: err.message || "Échec de la suppression",
        life: 5000,
      });
    }
  };

  const actionBodyTemplate = (rowData: Product) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        rounded
        outlined
        severity="secondary"
        tooltip="Modifier"
        tooltipOptions={{ position: 'top' }}
        onClick={() => {
          setProduct({ ...rowData });
          setProductDialog(true);
        }}
      />
      <Button
        icon="pi pi-trash"
        rounded
        outlined
        severity="danger"
        tooltip="Supprimer"
        tooltipOptions={{ position: 'top' }}
        onClick={() => deleteProduct(rowData)}
      />
    </div>
  );

  const priceBodyTemplate = (rowData: Product) => (
    <span className="font-bold text-primary">{rowData.price.toLocaleString("fr-FR")} FCFA</span>
  );

  const quantityBodyTemplate = (rowData: Product) => (
    <Badge 
      value={rowData.quantity} 
      severity={rowData.quantity > 10 ? "success" : rowData.quantity > 0 ? "warning" : "danger"}
      className="text-sm"
    />
  );

  const categoryBodyTemplate = (rowData: Product) => (
    <Tag 
      value={rowData.category?.name || "Non catégorisé"} 
      icon="pi pi-tag" 
      className="text-sm"
      severity="info"
    />
  );

  const imageBodyTemplate = (rowData: Product) => (
    rowData.imageUrl ? (
      <img 
        src={rowData.imageUrl} 
        alt={rowData.name} 
        className="w-12 h-12 rounded-lg shadow-md object-cover border" 
      />
    ) : (
      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
        <i className="pi pi-image text-gray-400" />
      </div>
    )
  );

  const leftToolbarTemplate = () => (
    <div className="flex flex-wrap gap-2">
      <Button
        label="Nouveau produit"
        icon="pi pi-plus"
        className="p-button-success"
        onClick={openNew}
        disabled={!selectedShop}
      />
      <Button
        label="Nouvelle catégorie"
        icon="pi pi-tags"
        className="p-button-help"
        onClick={() => setCategoryDialog(true)}
        disabled={!selectedShop}
      />
    </div>
  );

  return (
    <AppShell selectedShop={selectedShop} onShopSelect={setSelectedShop} refreshKey={refreshKey}>
      <Toast ref={toast} position="top-right" />
      
      <div className="grid">
        <div className="col-12">
          <Card className="shadow-2 border-round-lg">
            <Toolbar 
              className="mb-4 px-0" 
              left={leftToolbarTemplate} 
            />

            {loading ? (
              <div className="flex justify-content-center align-items-center py-8">
                <ProgressSpinner 
                  strokeWidth="4" 
                  animationDuration=".5s" 
                  className="w-2rem h-2rem" 
                />
                <span className="ml-3">Chargement des produits...</span>
              </div>
            ) : (
              <DataTable
                ref={dt}
                value={products}
                selection={selectedProducts}
                onSelectionChange={(e) => setSelectedProducts(e.value as Product[])}
                selectionMode="multiple"
                dataKey="id"
                paginator
                rows={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                globalFilter={globalFilter}
                stripedRows
                showGridlines
                className="p-datatable-sm"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} produits"
                emptyMessage="Aucun produit trouvé"
                header={
                  <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3">
                    <h3 className="m-0 text-2xl font-semibold">Gestion des produits</h3>
                    <span className="p-input-icon-left">
                      <i className="pi pi-search" />
                      <InputText
                        type="search"
                        placeholder="Rechercher..."
                        onInput={(e) => setGlobalFilter(e.currentTarget.value)}
                        className="w-full"
                      />
                    </span>
                  </div>
                }
              >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                <Column field="name" header="Nom" sortable style={{ minWidth: '16rem' }} />
                <Column field="price" header="Prix" body={priceBodyTemplate} sortable style={{ minWidth: '10rem' }} />
                <Column field="quantity" header="Quantité" body={quantityBodyTemplate} sortable style={{ minWidth: '10rem' }} />
                <Column header="Catégorie" body={categoryBodyTemplate} style={{ minWidth: '12rem' }} />
                <Column header="Image" body={imageBodyTemplate} style={{ minWidth: '10rem', textAlign: 'center' }} />
                <Column header="Actions" body={actionBodyTemplate} style={{ minWidth: '12rem' }} />
              </DataTable>
            )}
          </Card>
        </div>
      </div>

      {/* Product Dialog */}
      <Dialog
        visible={productDialog}
        onHide={hideDialog}
        header={product.id ? "Modifier le produit" : "Nouveau produit"}
        style={{ width: '600px' }}
        modal
        className="p-fluid"
        footer={
          <div>
            <Button
              label="Annuler"
              icon="pi pi-times"
              onClick={hideDialog}
              className="p-button-text"
            />
            <Button
              label="Enregistrer"
              icon="pi pi-check"
              onClick={saveProduct}
              autoFocus
              className="p-button-success"
            />
          </div>
        }
      >
        <div className="grid formgrid p-4">
          <div className="field col-12">
            <label htmlFor="name" className="font-medium">
              Nom du produit <span className="text-red-500">*</span>
            </label>
            <InputText
              id="name"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              required
              className={!product.name ? 'p-invalid' : ''}
            />
          </div>

          <div className="field col-6">
            <label htmlFor="price" className="font-medium">
              Prix (FCFA) <span className="text-red-500">*</span>
            </label>
            <InputNumber
              id="price"
              value={product.price}
              onValueChange={(e) => setProduct({ ...product, price: e.value || 0 })}
              mode="currency"
              currency="XOF"
              locale="fr-FR"
              required
            />
          </div>

          <div className="field col-6">
            <label htmlFor="quantity" className="font-medium">
              Quantité
            </label>
            <InputNumber
              id="quantity"
              value={product.quantity}
              onValueChange={(e) => setProduct({ ...product, quantity: e.value || 0 })}
              showButtons
              min={0}
            />
          </div>

          <div className="field col-12">
            <label htmlFor="barcode" className="font-medium">
              Code barre
            </label>
            <InputText
              id="barcode"
              value={product.barcode || ""}
              onChange={(e) => setProduct({ ...product, barcode: e.target.value })}
            />
          </div>

          <div className="field col-12">
            <label htmlFor="image" className="font-medium">
              Image du produit
            </label>
            <FileUpload
              ref={fileUploadRef}
              mode="basic"
              name="image"
              accept="image/*"
              maxFileSize={2000000}
              chooseLabel="Choisir une image"
              onSelect={(e) => setImageFile(e.files[0])}
              auto
            />
            {(imageFile || product.imageUrl) && (
              <div className="mt-3">
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : product.imageUrl || ''}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          <div className="field col-12">
            <label htmlFor="category" className="font-medium">
              Catégorie
            </label>
            <div className="flex gap-2">
              <Dropdown
                id="category"
                value={product.categoryId}
                onChange={(e) => setProduct({ ...product, categoryId: e.value })}
                options={categories}
                optionLabel="name"
                optionValue="id"
                placeholder="Sélectionner une catégorie"
                className="flex-1"
              />
              <Button
                icon="pi pi-plus"
                type="button"
                tooltip="Ajouter une catégorie"
                onClick={() => setCategoryDialog(true)}
                className="p-button-rounded p-button-text"
              />
            </div>
          </div>
        </div>
      </Dialog>

      {/* Category Dialog */}
      <Dialog
        visible={categoryDialog}
        onHide={() => setCategoryDialog(false)}
        header="Nouvelle catégorie"
        style={{ width: '400px' }}
        modal
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="categoryName" className="font-medium">
              Nom de la catégorie <span className="text-red-500">*</span>
            </label>
            <InputText
              id="categoryName"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            label="Annuler"
            icon="pi pi-times"
            onClick={() => setCategoryDialog(false)}
            className="p-button-text"
          />
          <Button
            label="Ajouter"
            icon="pi pi-check"
            onClick={async () => {
              if (newCategoryName.trim() && selectedShop) {
                try {
                  const newCat = await createCategory({ name: newCategoryName, shopId: selectedShop });
                  setCategories((prev) => [...prev, newCat]);
                  setProduct((prev) => ({ ...prev, categoryId: newCat.id }));
                  toast.current?.show({ 
                    severity: "success", 
                    summary: "Succès", 
                    detail: "Catégorie ajoutée",
                    life: 3000
                  });
                  setNewCategoryName("");
                  setCategoryDialog(false);
                } catch (err: any) {
                  toast.current?.show({ 
                    severity: "error", 
                    summary: "Erreur", 
                    detail: err.message || "Échec de la création",
                    life: 5000
                  });
                }
              }
            }}
            className="p-button-success"
            disabled={!newCategoryName.trim()}
          />
        </div>
      </Dialog>
    </AppShell>
  );
}