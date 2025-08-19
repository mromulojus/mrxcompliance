-- Security definer function to reorder columns safely
CREATE OR REPLACE FUNCTION public.move_task_column(
  p_board_id UUID,
  p_column_id UUID,
  p_new_index INT
)
RETURNS VOID AS $$
DECLARE
  current_index INT;
BEGIN
  SELECT order_index INTO current_index FROM public.task_columns WHERE id = p_column_id AND board_id = p_board_id;
  IF current_index IS NULL THEN
    RAISE EXCEPTION 'Column not found on board';
  END IF;

  IF p_new_index < 0 THEN p_new_index := 0; END IF;

  IF p_new_index > current_index THEN
    UPDATE public.task_columns
    SET order_index = order_index - 1
    WHERE board_id = p_board_id AND order_index > current_index AND order_index <= p_new_index;
  ELSIF p_new_index < current_index THEN
    UPDATE public.task_columns
    SET order_index = order_index + 1
    WHERE board_id = p_board_id AND order_index < current_index AND order_index >= p_new_index;
  END IF;

  UPDATE public.task_columns SET order_index = p_new_index WHERE id = p_column_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

