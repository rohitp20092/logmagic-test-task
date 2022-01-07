import { ContainerSpec, OrderRequest, ShipmentRecord } from "./interfaces";

export class OrderHandler {
  constructor(private parameters: { containerSpecs: ContainerSpec[] }) {}

  packOrder(orderRequest: OrderRequest): ShipmentRecord {
    /* TODO: replace with actual implementation */

    let visited: Map<
      string,
      Array<{
        id: string;
        quantity: number;
      }>
    > = new Map(); /* collection of all the existing container */
    let total: number = 0;
    let collectedItem: number = 0; /* number of items that have been successfully allocated onto the container */
    let containers: ShipmentRecord["containers"] = [];
    let containersValue: number = 0;

    orderRequest.products.map((current) => {
      const {
        dimensions: {
          length: productLength,
          height: productHeight,
          width: productWidth,
        },
        id: productId,
        orderedQuantity,
      } = current;

      total += orderedQuantity;
      this.parameters.containerSpecs.map(
        ({
          dimensions: {
            length: containerLength,
            height: containerHeight,
            width: containerWidth,
          },
          containerType,
        }) => {
          let orderedQuantity: number = current.orderedQuantity;

          if (
            productLength <= containerLength &&
            productHeight <= containerHeight &&
            productWidth <= containerWidth
          ) {
            const maxCapacity = Math.floor(
              (containerLength * containerHeight * containerWidth) /
                (productLength * productHeight * productWidth)
            );

            while (orderedQuantity > 0) {
              const hasReachedMaxCapacity: boolean =
                orderedQuantity < maxCapacity;
              if (!visited.get(containerType)) {
                visited.set(containerType, []);
              }

              /**
               * wachao {visited, orderedQuantity, maxCapacity, hasReachedMaxCapacity, orderRequest.products}
               */
              const quantity: number = hasReachedMaxCapacity
                ? orderedQuantity
                : maxCapacity;
              visited.set(containerType, [
                ...(visited.get(containerType) || []),
                {
                  id: productId,
                  quantity,
                },
              ]);

              collectedItem += quantity;
              containersValue +=
                containerLength * containerHeight * containerWidth;
              containers.push({
                containerType: containerType,
                containingProducts: [
                  {
                    id: productId,
                    quantity,
                  },
                ],
              });
              orderedQuantity = orderedQuantity - maxCapacity;
            }
          }
        }
      );
    });

    if (visited.size === 0) throw new Error("impossible");

    if (total !== collectedItem) throw new Error("impossible");

    const result: ShipmentRecord = {
      orderId: orderRequest.id,
      totalVolume: {
        unit: "cubic centimeter",
        value: containersValue,
      },
      containers,
    };

    return result;
  }
}