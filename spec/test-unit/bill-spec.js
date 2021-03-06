var Bill = require('../../src/bill');
var BasketItems = require('../../src/basket-items');

describe('Bill', function () {
    var item0, item1, bill;
    beforeEach(function () {
        bill = new Bill();
        item0 = require('../fixtures/item000000.json');
        item1 = require('../fixtures/item000001.json');
    });

    describe('#add', function () {
        it('add single item', function () {
            bill.add(item0, 1);
            expect(bill._items).toEqual([new BasketItems(item0, 1)]);
        });

        it('add multiple same items', function () {
            bill.add(item0, 1);
            bill.add(item0, 2);
            expect(bill._items).toEqual([new BasketItems(item0, 3)]);
        });
    });

    describe('#items', function () {
        it('returns all items', function () {
            bill.add(item0, 2);

            expect(bill.items()).toEqual([new BasketItems(item0, 2)]);
        });
    });

    describe('#toString', function () {
        it('print items info and total price without discount', function () {
            bill.add(item0, 3);
            bill.add(item1, 5);

            expect(bill.toString()).toEqual(
                '名称：可口可乐，数量：3瓶，单价：3.00(元)，小计：9.00(元)\n' +
                '名称：羽毛球，数量：5个，单价：1.00(元)，小计：5.00(元)\n' +
                '----------------------\n' +
                "总计：14.00(元)"
            );
        });
        it('print items info and total price with discount', function () {
            var promotion = jasmine.createSpyObj('promotion', ['checkItem', 'discountStrategy']);
            promotion.checkItem.and.callFake(function(basketItem) { return basketItem.item === item0; });
            promotion.discountStrategy.and.callFake(function (basketItem) {basketItem.setDiscount(3, '买三免一')});

            bill.add(item0, 3);
            bill.add(item1, 5);
            bill.applyPromotion(promotion);

            expect(bill.toString()).toEqual(
                '名称：可口可乐，数量：3瓶，单价：3.00(元)，小计：6.00(元)，优惠3.00(元)\n' +
                '名称：羽毛球，数量：5个，单价：1.00(元)，小计：5.00(元)\n' +
                '----------------------\n' +
                '单品打折商品：\n' +
                '名称：可口可乐，折扣：买三免一\n' +
                '----------------------\n' +
                '总计：11.00(元)\n' +
                '节省：3.00(元)'
            );
        });
    });

    describe('#applyPromotion', function () {
        it('save promotion', function () {
            var promotion = jasmine.createSpyObj('promotion', ['checkItem', 'discountStrategy']);
            promotion.checkItem.and.callFake(function(basketItem) { return basketItem.item === item0; });
            bill.add(item0, 1);
            bill.add(item1, 2);
            bill.applyPromotion(promotion);
            expect(bill._promotion).toEqual(promotion);
            expect(promotion.discountStrategy.calls.mostRecent().args[0].item).toEqual(item0);

        });
    });
});
