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
import Image from "next/image";

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
          onClose={() => closeModal}
          className="relative z-50 dialog-container "
        >
          <div className="min-h-screen px-4 text-center">
            <div className="dialog-content">
              <div className="flex flex-col">
                <div className="flex justify-between">
                  <div className="p-3 border border-gray-200 rounded-10">
                    <Image
                      src="/assets/icons/logo.svg"
                      alt="logo"
                      width={28}
                      height={28}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default Modal;
