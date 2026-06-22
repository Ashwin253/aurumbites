import { NextResponse } from "next/server";
import { getShopPageData } from "../../../../lib/catalog";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const collectionHandle = searchParams.get("collection") || "all";
  const brandHandle = searchParams.get("brand") || "all";
  const productTypeHandle = searchParams.get("type") || "all";

  try {
    const data = await getShopPageData({
      first: 9,
      collectionHandle,
      brandHandle,
      productTypeHandle,
    });

    return NextResponse.json({
      isConfigured: data.isConfigured,
      error: data.error,
      collections: data.collections,
      activeCollection: data.activeCollection,
      brands: data.brands,
      activeBrand: data.activeBrand,
      productTypes: data.productTypes,
      activeProductType: data.activeProductType,
      products: data.products,
      shop: data.shop,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load the shop catalog.",
      },
      { status: 500 }
    );
  }
}
