import { cachedVoucherRepository } from "../../repositories/voucher/cached";
import { SelectVoucher } from "../../db/schema/voucher";
import { VoucherSchema } from "../../validations/voucher";

export async function getVouchersService() {
    const vouchers = await cachedVoucherRepository.getVouchers();
    return vouchers;
}

export async function createVoucherService(data: VoucherSchema) {
    const now = new Date().toISOString();
    const voucherData = {
        ...data,
        createdAt: now,
        updatedAt: now,
    };
    const voucher = await cachedVoucherRepository.createVoucher(voucherData);
    return voucher;
}

export async function updateVoucherService(data: SelectVoucher) {
    const idVoucher = await cachedVoucherRepository.getVoucherById(data.id)
    if (idVoucher) {
        await cachedVoucherRepository.updateVoucher(data)

    }
}

export async function getVoucherByIdService(id: number) {
    const voucher = await cachedVoucherRepository.getVoucherById(id);
    return voucher;
}


export async function deleteVoucherService(id: number) {
    const idVoucher = await cachedVoucherRepository.getVoucherById(id)
    if (idVoucher) {
        await cachedVoucherRepository.deleteVoucher(idVoucher.id)
    }

}