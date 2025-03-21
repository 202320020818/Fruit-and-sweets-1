import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Table } from "flowbite-react";
import { FaTrashAlt } from "react-icons/fa";
import { removeFromCart } from "../redux/cart/cartSlice";

export default function CartPage() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  // Calculate total price
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">🛒 Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <Table>
            <Table.Head>
              <Table.HeadCell>Product</Table.HeadCell>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell>Quantity</Table.HeadCell>
              <Table.HeadCell>Total</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {cartItems.map((item) => (
                <Table.Row key={item.id} className="bg-white dark:bg-gray-800">
                  <Table.Cell>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded"
                    />
                  </Table.Cell>
                  <Table.Cell className="font-medium">{item.name}</Table.Cell>
                  <Table.Cell>${item.price.toFixed(2)}</Table.Cell>
                  <Table.Cell>{item.quantity}</Table.Cell>
                  <Table.Cell>
                    ${(item.price * item.quantity).toFixed(2)}
                  </Table.Cell>
                  <Table.Cell>
                    <Button
                      color="failure"
                      onClick={() => dispatch(removeFromCart(item.id))}
                      pill
                    >
                      <FaTrashAlt />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {/* Total Price & Checkout Button */}
          <div className="mt-4 flex justify-between items-center">
            <h3 className="text-xl font-semibold">
              Total: ${totalPrice.toFixed(2)}
            </h3>
            <Button gradientDuoTone="purpleToBlue">Proceed to Checkout</Button>
          </div>
        </>
      )}
    </div>
  );
}
