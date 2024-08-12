"use client";
import { Fragment, useState } from "react";
import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
} from "@headlessui/react";
import React from "react";

const Modal = () => {
  const [isOpen, setisOpen] = useState(false);
  const openModal = () => setisOpen(true);
  const closeModal = () => setisOpen(false);
  return (
    <>
      <button type="button" className="btn" onClick={openModal}>
        Track
      </button>
      <Transition show={isOpen} as={Fragment}>
        <Dialog
          open={isOpen}
          onClose={() => setisOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel className="max-w-lg space-y-4 border bg-white p-12">
              <DialogTitle className="font-bold">
                Deactivate account
              </DialogTitle>
              <Description>
                This will permanently deactivate your account
              </Description>
              <p>
                Are you sure you want to deactivate your account? All of your
                data will be permanently removed.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setisOpen(false)}>Cancel</button>
                <button onClick={() => setisOpen(false)}>Deactivate</button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Modal;
