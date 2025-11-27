package service;

import dao.PaymentDAO;
import model.Payment;
import java.util.List;

public class PaymentService {
    private PaymentDAO paymentDAO;

    public PaymentService() {
        this.paymentDAO = new PaymentDAO();
    }

    public List<Payment> findAll() {
        return paymentDAO.findAll();
    }

    public Payment findById(Integer paymentId) {
        return paymentDAO.findById(paymentId);
    }

    public List<Payment> findByBookingId(Integer bookingId) {
        return paymentDAO.findByBookingId(bookingId);
    }

    public Payment create(Payment payment) {
        int id = paymentDAO.create(payment);
        if (id > 0) {
            payment.setPaymentId(id);
            return payment;
        }
        return null;
    }

    public boolean updateStatus(int paymentId, String status) {
        return paymentDAO.updateStatus(paymentId, status);
    }
}


